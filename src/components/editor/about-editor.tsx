'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { User, Save, Loader2, Camera, X, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePortfolioStore } from '@/store/portfolio-store';
import { useAuthStore } from '@/store/auth-store';
import { toast } from 'sonner';

export function AboutEditor() {
  const { portfolio, updateContent } = usePortfolioStore();
  const { user, updateUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [aboutText, setAboutText] = useState(portfolio?.content?.aboutText || user?.bio || '');
  const [jobTitle, setJobTitle] = useState(portfolio?.content?.jobTitle || '');
  const [name, setName] = useState(user?.name || '');
  const [location, setLocation] = useState(user?.location || '');
  const [company, setCompany] = useState(user?.company || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setAboutText(portfolio?.content?.aboutText || user?.bio || '');
    setJobTitle(portfolio?.content?.jobTitle || '');
  }, [portfolio?.content?.aboutText, portfolio?.content?.jobTitle, user?.bio]);

  useEffect(() => {
    setName(user?.name || '');
    setLocation(user?.location || '');
    setCompany(user?.company || '');
    setAvatarUrl(user?.avatarUrl || '');
  }, [user]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large. Maximum size is 5MB.');
      return;
    }

    setIsUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'signature/avatars');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload image');
      }

      const data = await response.json();
      setAvatarUrl(data.url);
      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload image');
    } finally {
      setIsUploadingImage(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = () => {
    setAvatarUrl('');
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Save content
      if (portfolio?.id) {
        const response = await fetch('/api/portfolio/content', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            portfolioId: portfolio.id,
            aboutText,
            jobTitle,
          }),
        });

        if (!response.ok) throw new Error('Failed to save');
        
        updateContent({ aboutText, jobTitle });
        
        // Update the portfolio_data cookie to keep it in sync
        const currentContent = portfolio.content || {
          id: '',
          portfolioId: portfolio.id,
          jobTitle: '',
          aboutText: '',
          resumeUrl: null,
          contactEmail: null,
          linkedinUrl: null,
          githubUrl: null,
          twitterUrl: null,
          websiteUrl: null,
        };
        const updatedPortfolio = { 
          ...portfolio, 
          content: { ...currentContent, aboutText, jobTitle } 
        };
        document.cookie = `portfolio_data=${encodeURIComponent(JSON.stringify(updatedPortfolio))}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
      }

      // Update user profile including avatarUrl
      if (user?.id) {
        const response = await fetch('/api/user', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            name,
            location,
            company,
            avatarUrl,
          }),
        });

        if (!response.ok) throw new Error('Failed to update profile');

        const userData = await response.json();
        
        // Update local store
        updateUser({ name, location, company, avatarUrl });
        
        // Update the user_data cookie to keep it in sync
        if (userData.user) {
          document.cookie = `user_data=${encodeURIComponent(JSON.stringify({
            id: userData.user.id,
            email: userData.user.email,
            name: userData.user.name,
            username: userData.user.username,
            githubId: userData.user.githubId,
            githubLogin: userData.user.githubLogin,
            avatarUrl: userData.user.avatarUrl,
            bio: userData.user.bio,
            location: userData.user.location,
            company: userData.user.company,
            blog: userData.user.blog,
          }))}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
        }
      }

      toast.success('About section saved!');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save changes');
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
            <User className="w-5 h-5 text-emerald-500" />
            About Me
          </CardTitle>
          <CardDescription>
            Tell your story. This will appear at the top of your portfolio.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Profile Image Section */}
          <div className="space-y-3">
            <Label>Profile Image</Label>
            <div className="flex items-start gap-4">
              {/* Image Preview */}
              <div className="relative group">
                {avatarUrl ? (
                  <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-slate-200 dark:border-slate-700">
                    <img
                      src={avatarUrl}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                    {/* Remove overlay */}
                    <button
                      onClick={handleRemoveImage}
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      <X className="w-6 h-6 text-white" />
                    </button>
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center">
                    <User className="w-10 h-10 text-slate-400" />
                  </div>
                )}
              </div>

              {/* Upload Controls */}
              <div className="flex-1 space-y-2">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Upload a profile picture to personalize your portfolio.
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  Recommended: Square image, at least 200x200px. Max 5MB.
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingImage}
                  className="mt-2"
                >
                  {isUploadingImage ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Upload className="w-4 h-4 mr-2" />
                  )}
                  {isUploadingImage ? 'Uploading...' : 'Upload Image'}
                </Button>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Display Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="bg-slate-50 dark:bg-slate-800"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City, Country"
                  className="bg-slate-50 dark:bg-slate-800"
                />
              </div>
            </div>

            <div className="space-y-2 mt-4">
              <Label htmlFor="jobTitle">Job Title</Label>
              <Input
                id="jobTitle"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g., Full-Stack Developer, UX Designer, Product Manager"
                className="bg-slate-50 dark:bg-slate-800"
              />
              <p className="text-xs text-slate-500">This will be displayed as your title on your portfolio.</p>
            </div>

            <div className="space-y-2 mt-4">
              <Label htmlFor="company">Company / Organization</Label>
              <Input
                id="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Current employer"
                className="bg-slate-50 dark:bg-slate-800"
              />
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-700 pt-6 space-y-2">
            <Label htmlFor="about">Bio / About Me</Label>
            <Textarea
              id="about"
              value={aboutText}
              onChange={(e) => setAboutText(e.target.value)}
              placeholder="Write a brief introduction about yourself, your background, and what you're passionate about..."
              rows={6}
              className="bg-slate-50 dark:bg-slate-800 resize-none"
            />
            <p className="text-xs text-slate-500">
              {aboutText.length} characters
            </p>
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
