'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Save, Loader2, Linkedin, Github, Twitter, Globe, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePortfolioStore } from '@/store/portfolio-store';
import { useAuthStore } from '@/store/auth-store';
import { toast } from 'sonner';

export function ContactEditor() {
  const { portfolio, updateContent } = usePortfolioStore();
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [contactEmail, setContactEmail] = useState(portfolio?.content?.contactEmail || user?.email || '');
  const [linkedinUrl, setLinkedinUrl] = useState(portfolio?.content?.linkedinUrl || '');
  const [githubUrl, setGithubUrl] = useState(
    portfolio?.content?.githubUrl || (user?.githubLogin ? `https://github.com/${user.githubLogin}` : '')
  );
  const [twitterUrl, setTwitterUrl] = useState(portfolio?.content?.twitterUrl || '');
  const [websiteUrl, setWebsiteUrl] = useState(portfolio?.content?.websiteUrl || user?.blog || '');
  const [resumeUrl, setResumeUrl] = useState(portfolio?.content?.resumeUrl || '');

  useEffect(() => {
    setContactEmail(portfolio?.content?.contactEmail || user?.email || '');
    setLinkedinUrl(portfolio?.content?.linkedinUrl || '');
    setGithubUrl(portfolio?.content?.githubUrl || (user?.githubLogin ? `https://github.com/${user.githubLogin}` : ''));
    setTwitterUrl(portfolio?.content?.twitterUrl || '');
    setWebsiteUrl(portfolio?.content?.websiteUrl || user?.blog || '');
    setResumeUrl(portfolio?.content?.resumeUrl || '');
  }, [portfolio?.content, user]);

  const handleSave = async () => {
    if (!portfolio?.id) {
      toast.error('Portfolio not found');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/portfolio/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          portfolioId: portfolio.id,
          contactEmail,
          linkedinUrl,
          githubUrl,
          twitterUrl,
          websiteUrl,
          resumeUrl,
        }),
      });

      if (!response.ok) throw new Error('Failed to save');

      updateContent({
        contactEmail,
        linkedinUrl,
        githubUrl,
        twitterUrl,
        websiteUrl,
        resumeUrl,
      });

      // Update the portfolio_data cookie to keep it in sync
      if (portfolio) {
        const currentContent = portfolio.content || {
          id: '',
          portfolioId: portfolio.id,
          jobTitle: null,
          aboutText: null,
          resumeUrl: null,
          contactEmail: null,
          linkedinUrl: null,
          githubUrl: null,
          twitterUrl: null,
          websiteUrl: null,
        };
        const updatedPortfolio = { 
          ...portfolio, 
          content: { 
            ...currentContent,
            contactEmail,
            linkedinUrl,
            githubUrl,
            twitterUrl,
            websiteUrl,
            resumeUrl,
          } 
        };
        document.cookie = `portfolio_data=${encodeURIComponent(JSON.stringify(updatedPortfolio))}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
      }

      toast.success('Contact information saved!');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save contact information');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card className="border-0 shadow-lg bg-white dark:bg-slate-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-emerald-500" />
            Contact Information
          </CardTitle>
          <CardDescription>
            Add your contact details so visitors can reach you.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="contact-email" className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400" />
                Email Address
              </Label>
              <Input
                id="contact-email"
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="your@email.com"
                className="bg-slate-50 dark:bg-slate-800"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkedin" className="flex items-center gap-2">
                <Linkedin className="w-4 h-4 text-slate-400" />
                LinkedIn
              </Label>
              <Input
                id="linkedin"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/in/yourprofile"
                className="bg-slate-50 dark:bg-slate-800"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="github" className="flex items-center gap-2">
                <Github className="w-4 h-4 text-slate-400" />
                GitHub
              </Label>
              <Input
                id="github"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/yourusername"
                className="bg-slate-50 dark:bg-slate-800"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="twitter" className="flex items-center gap-2">
                <Twitter className="w-4 h-4 text-slate-400" />
                Twitter / X
              </Label>
              <Input
                id="twitter"
                value={twitterUrl}
                onChange={(e) => setTwitterUrl(e.target.value)}
                placeholder="https://twitter.com/yourhandle"
                className="bg-slate-50 dark:bg-slate-800"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website" className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-slate-400" />
                Personal Website
              </Label>
              <Input
                id="website"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://yourwebsite.com"
                className="bg-slate-50 dark:bg-slate-800"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="resume" className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-400" />
                Resume URL
              </Label>
              <Input
                id="resume"
                value={resumeUrl}
                onChange={(e) => setResumeUrl(e.target.value)}
                placeholder="https://drive.google.com/your-resume"
                className="bg-slate-50 dark:bg-slate-800"
              />
              <p className="text-xs text-slate-500">
                Link to your resume PDF (Google Drive, Dropbox, etc.)
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
