import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const username = request.nextUrl.searchParams.get('username');

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    // Fetch user data from GitHub public API
    const userResponse = await fetch(`https://api.github.com/users/${username}`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Portfolio-Generator',
      },
    });

    if (!userResponse.ok) {
      if (userResponse.status === 404) {
        return NextResponse.json({ error: 'GitHub user not found' }, { status: 404 });
      }
      return NextResponse.json({ error: 'Failed to fetch GitHub user' }, { status: 500 });
    }

    const userData = await userResponse.json();

    // Fetch user's repositories
    const reposResponse = await fetch(
      `https://api.github.com/users/${username}/repos?sort=stars&direction=desc&per_page=10`,
      {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Portfolio-Generator',
        },
      }
    );

    const reposData = reposResponse.ok ? await reposResponse.json() : [];

    // Calculate primary languages
    const languageCount: Record<string, number> = {};
    reposData.forEach((repo: { language: string | null }) => {
      if (repo.language) {
        languageCount[repo.language] = (languageCount[repo.language] || 0) + 1;
      }
    });

    const topLanguages = Object.entries(languageCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([lang]) => lang);

    return NextResponse.json({
      user: {
        githubId: userData.id?.toString() || null,
        githubLogin: userData.login,
        name: userData.name || userData.login,
        email: userData.email || `${userData.login}@users.noreply.github.com`,
        avatarUrl: userData.avatar_url,
        bio: userData.bio,
        location: userData.location,
        company: userData.company,
        blog: userData.blog,
        publicRepos: userData.public_repos,
        followers: userData.followers,
        following: userData.following,
      },
      repositories: reposData.map((repo: {
        id: number;
        name: string;
        description: string | null;
        html_url: string;
        stargazers_count: number;
        forks_count: number;
        language: string | null;
        homepage: string | null;
      }) => ({
        id: repo.id,
        name: repo.name,
        description: repo.description,
        url: repo.html_url,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        language: repo.language,
        homepage: repo.homepage,
      })),
      topLanguages,
    });
  } catch (error) {
    console.error('GitHub API error:', error);
    return NextResponse.json({ error: 'Failed to fetch GitHub data' }, { status: 500 });
  }
}
