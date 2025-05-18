from datetime import datetime, timezone
from app import db, bcrypt
import json
from flask import current_app, url_for # For generating full URLs

# Association table for User Wishlist
wishlist_items = db.Table('wishlist_items',
    db.Column('user_id', db.Integer, db.ForeignKey('user.id', ondelete='CASCADE'), primary_key=True),
    db.Column('product_id', db.Integer, db.ForeignKey('product.id', ondelete='CASCADE'), primary_key=True)
)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(128), nullable=False)
    profile_image = db.Column(db.String(255), nullable=True) # Stores filename or external URL
    created_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))

    products = db.relationship('Product', backref='seller', lazy=True, cascade="all, delete-orphan")
    cart_items = db.relationship('CartItem', backref='user', lazy=True, cascade="all, delete-orphan")
    purchases = db.relationship('Purchase', backref='user', lazy=True, cascade="all, delete-orphan")
    wishlist = db.relationship('Product', secondary=wishlist_items, lazy='subquery',
                               backref=db.backref('wished_by_users', lazy=True))

    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)

    def get_profile_image_url(self):
        if self.profile_image:
            if self.profile_image.startswith(('http://', 'https://')):
                return self.profile_image
            try:
                # Assumes self.profile_image stores just the filename for local uploads
                return url_for('uploaded_file_route', filename=self.profile_image, _external=True)
            except RuntimeError: # Outside of application context
                # Fallback for scripts or if url_for fails
                uploads_path = current_app.config.get('FLASK_STATIC_UPLOADS_URL', '/uploads').strip('/')
                return f"/{uploads_path}/{self.profile_image}"
        return None


    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'username': self.username,
            'profileImage': self.get_profile_image_url(), # Use helper
            'createdAt': self.created_at.isoformat() if self.created_at else None
        }
    def __repr__(self):
        return f"<User {self.username}>"

class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(150), nullable=False, index=True)
    description = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(50), nullable=False, index=True)
    price = db.Column(db.Float, nullable=False)
    _image_filenames = db.Column(db.Text, nullable=True, name='image_filenames') 
    seller_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False, index=True)
    created_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))

    @property
    def image_filenames_list(self): # Renamed to avoid conflict with images property
        if self._image_filenames:
            try:
                return json.loads(self._image_filenames)
            except json.JSONDecodeError:
                return []
        return []

    @image_filenames_list.setter # Corresponds to image_filenames_list property
    def image_filenames_list(self, filenames_list):
        if isinstance(filenames_list, list) and all(isinstance(fn, str) for fn in filenames_list):
            self._image_filenames = json.dumps(filenames_list)
        else:
            self._image_filenames = json.dumps([])
            current_app.logger.warning(f"Invalid type for product image filenames: {filenames_list}. Expected list of strings.")

    @property
    def images(self): # This property will return full URLs
        """Constructs full URLs for product images."""
        urls = []
        if self._image_filenames:
            try:
                filenames = json.loads(self._image_filenames)
                for filename in filenames:
                    if filename.startswith(('http://', 'https://')): # If it's already a full URL (e.g. placeholder)
                        urls.append(filename)
                    else:
                        try: # Construct URL for locally uploaded files
                            urls.append(url_for('uploaded_file_route', filename=filename, _external=True))
                        except RuntimeError: # Fallback if outside app context
                            uploads_path = current_app.config.get('FLASK_STATIC_UPLOADS_URL', '/uploads').strip('/')
                            urls.append(f"/{uploads_path}/{filename}")
            except json.JSONDecodeError:
                pass
        return urls

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'category': self.category,
            'price': self.price,
            'images': self.images, # Uses the property that returns full URLs
            'sellerId': self.seller_id,
            'sellerName': self.seller.username if self.seller else "Unknown Seller",
            'createdAt': self.created_at.isoformat() if self.created_at else None
        }
    def __repr__(self):
        return f"<Product {self.title}>"

class CartItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete='CASCADE'), nullable=False, index=True)
    product_id = db.Column(db.Integer, db.ForeignKey('product.id', ondelete='CASCADE'), nullable=False, index=True)
    quantity = db.Column(db.Integer, nullable=False, default=1)
    added_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    product = db.relationship('Product', backref=db.backref('cart_associations', lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'productId': self.product_id,
            'quantity': self.quantity,
            'product': self.product.to_dict() if self.product else None,
            'addedAt': self.added_at.isoformat() if self.added_at else None
        }
    def __repr__(self):
        return f"<CartItem user_id={self.user_id} product_id={self.product_id} quantity={self.quantity}>"

class Purchase(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete='SET NULL'), nullable=True, index=True)
    purchase_date = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    total_amount = db.Column(db.Float, nullable=False)
    items = db.relationship('PurchaseItem', backref='purchase', lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            'id': self.id,
            'userId': self.user_id,
            'purchaseDate': self.purchase_date.isoformat() if self.purchase_date else None,
            'totalAmount': self.total_amount,
            'items': [item.to_dict() for item in self.items]
        }
    def __repr__(self):
        return f"<Purchase id={self.id} user_id={self.user_id} total={self.total_amount}>"

class PurchaseItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    purchase_id = db.Column(db.Integer, db.ForeignKey('purchase.id', ondelete='CASCADE'), nullable=False, index=True)
    product_id = db.Column(db.Integer, db.ForeignKey('product.id', ondelete='SET NULL'), nullable=True)
    quantity = db.Column(db.Integer, nullable=False)
    price_at_purchase = db.Column(db.Float, nullable=False)
    product_title = db.Column(db.String(150), nullable=False)
    _product_image_filename = db.Column(db.String(255), nullable=True, name='product_image_filename')

    original_product = db.relationship('Product', foreign_keys=[product_id])

    @property
    def product_image_url(self): # Renamed for clarity
        if self._product_image_filename:
            if self._product_image_filename.startswith(('http://', 'https://')):
                return self._product_image_filename
            try:
                return url_for('uploaded_file_route', filename=self._product_image_filename, _external=True)
            except RuntimeError:
                 uploads_path = current_app.config.get('FLASK_STATIC_UPLOADS_URL', '/uploads').strip('/')
                 return f"/{uploads_path}/{self._product_image_filename}"
        return None

    @product_image_url.setter
    def product_image_url(self, filename_or_url):
        if isinstance(filename_or_url, str):
            self._product_image_filename = filename_or_url # Store filename or full URL if provided
        else:
            self._product_image_filename = None

    def to_dict(self):
        product_snapshot = {
            'id': self.product_id,
            'title': self.product_title,
            'description': self.original_product.description if self.original_product else "N/A",
            'category': self.original_product.category if self.original_product else "N/A",
            'price': self.price_at_purchase,
            'images': [self.product_image_url] if self.product_image_url else [],
            'sellerId': self.original_product.seller_id if self.original_product else None,
            'sellerName': self.original_product.seller.username if self.original_product and self.original_product.seller else "N/A",
            'createdAt': self.original_product.created_at.isoformat() if self.original_product and self.original_product.created_at else None
        }
        return {
            'id': self.id,
            'productId': self.product_id,
            'product': product_snapshot,
            'purchaseDate': self.purchase.purchase_date.isoformat() if self.purchase and self.purchase.purchase_date else None,
            'quantity': self.quantity
        }
    def __repr__(self):
        return f"<PurchaseItem purchase_id={self.purchase_id} product_title='{self.product_title}' quantity={self.quantity}>"
