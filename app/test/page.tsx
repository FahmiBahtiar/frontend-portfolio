// Test API connection
import { AboutService } from '@/lib/services/about';

export default async function TestPage() {
  try {
    const passions = await AboutService.getPassions();
    const highlights = await AboutService.getHighlights();

    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">API Connection Test</h1>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Passions:</h2>
          <pre className="bg-gray-100 p-4 rounded">
            {JSON.stringify(passions, null, 2)}
          </pre>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Highlights:</h2>
          <pre className="bg-gray-100 p-4 rounded">
            {JSON.stringify(highlights, null, 2)}
          </pre>
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4 text-red-600">API Connection Failed</h1>
        <p className="text-red-500">{error instanceof Error ? error.message : 'Unknown error'}</p>
      </div>
    );
  }
}