
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <Layout>
      <div className="page-container min-h-[60vh] flex flex-col items-center justify-center text-center">
        <h1 className="text-4xl font-bold text-eco-500 mb-6">404</h1>
        <h2 className="text-2xl font-semibold mb-3">Page Not Found</h2>
        <p className="text-gray-600 max-w-md mb-8">
          We couldn't find the page you're looking for. It may have been moved or doesn't exist.
        </p>
        <Link to="/">
          <Button size="lg">Return to Home</Button>
        </Link>
      </div>
    </Layout>
  );
}
