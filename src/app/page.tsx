import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Navigation } from "~/components/navigation/Navigation";
import { ArrowRight, Users, Calendar, BarChart3, CheckCircle } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <Navigation />

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Advanced Project Management with
            <span className="text-blue-600"> Day-Specific Scheduling</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Break free from traditional uniform-week assumptions. Manage projects with
            variable daily patterns, time zone support, and real-time performance optimization.
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Link href="/register">
              <Button size="lg" className="text-lg px-8 py-3">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="text-lg px-8 py-3">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose wale-plan?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center">
              <CardHeader>
                <Calendar className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>Day-Specific Scheduling</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Revolutionary scheduling engine that respects variable daily availability
                  and resource patterns
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>Team Collaboration</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Time zone support for distributed teams with real-time conflict detection
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <BarChart3 className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>Performance Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Sub-second project recalculation with intelligent caching and optimization
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <CheckCircle className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>Enterprise Ready</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Multi-tenant architecture with GDPR compliance and audit trails
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Your Project Management?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of teams already using wale-plan for advanced scheduling
          </p>
          <Link href="/register">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-3">
              Start Your Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-6 text-center">
          <p className="text-gray-400">
            © 2025 wale-plan. Advanced project management for modern teams.
          </p>
        </div>
      </footer>
    </div>
  );
}
