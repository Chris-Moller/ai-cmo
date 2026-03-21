import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function ProjectCreate() {
  return (
    <>
      <Header title="New Project" description="Set up a new competitive intelligence project" />
      <div className="p-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-2">
                <label
                  htmlFor="name"
                  className="text-sm font-medium text-zinc-300"
                >
                  Project Name
                </label>
                <Input
                  id="name"
                  placeholder="e.g. Q1 Market Expansion"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="description"
                  className="text-sm font-medium text-zinc-300"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  rows={4}
                  placeholder="Describe the intelligence goals for this project..."
                  className="flex w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 shadow-sm placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="industry"
                  className="text-sm font-medium text-zinc-300"
                >
                  Industry
                </label>
                <select
                  id="industry"
                  className="flex h-9 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-1 text-sm text-zinc-100 shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400"
                >
                  <option value="">Select industry...</option>
                  <option value="saas">SaaS / Software</option>
                  <option value="fintech">FinTech</option>
                  <option value="ecommerce">E-Commerce</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="devtools">Developer Tools</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <Button disabled>Create Project</Button>
                <Button variant="outline">Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
