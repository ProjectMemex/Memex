const express = require("express");
const cors = require("cors");
const axios = require("axios");
const cheerio = require("cheerio");

const app = express();
app.use(cors());
app.use(express.json());

// Full list of websites
const websites = [
  { url: "https://www.bombuj.si", title: "Bombuj", category: ".si", description: "Streaming TV shows", ranking_score: 8.5 },
  { url: "https://ww.kukaj.io", title: "Kukaj", category: ".io", description: "Movies and TV streaming", ranking_score: 8.7 },
  { url: "https://sweet.tv", title: "SweetTV", category: ".tv", description: "Online TV streaming", ranking_score: 8.0 },
  { url: "https://www.netflix.com", title: "Netflix", category: ".com", description: "Movies and TV shows", ranking_score: 10.0 },
  { url: "https://www.disneyplus.com", title: "Disney Plus", category: ".com", description: "Disney streaming service", ranking_score: 9.8 },
  { url: "https://www.hbomax.com", title: "HBO Max", category: ".com", description: "Movies and TV shows streaming", ranking_score: 9.5 },
  { url: "https://www.crunchyroll.com", title: "Crunchyroll", category: ".com", description: "Anime streaming service", ranking_score: 9.0 },
  { url: "https://www.tapas.io", title: "Tapas.io", category: ".io", description: "Webcomics and novels", ranking_score: 8.6 },
  { url: "https://www.webtoons.com", title: "Webtoons", category: ".com", description: "Webcomics platform", ranking_score: 8.9 },
  { url: "https://www.tumblr.com", title: "Tumblr", category: ".com", description: "Microblogging platform", ranking_score: 8.5 },
  { url: "https://www.reddit.com", title: "Reddit", category: ".com", description: "Discussion forum", ranking_score: 9.0 },
  { url: "https://www.instagram.com", title: "Instagram", category: ".com", description: "Photo and video sharing", ranking_score: 9.5 },
  { url: "https://www.messenger.com", title: "Messenger", category: ".com", description: "Instant messaging service", ranking_score: 9.2 },
  { url: "https://docs.google.com", title: "Google Docs", category: ".com", description: "Document editing and sharing", ranking_score: 9.3 },
  { url: "https://www.youtube.com", title: "YouTube", category: ".com", description: "Videos, tutorials, music", ranking_score: 10.0 },
  { url: "https://proton.me/mail", title: "Proton Mail", category: ".me", description: "Secure email service", ranking_score: 9.0 },
  { url: "https://proton.me/calendar", title: "Proton Calendar", category: ".me", description: "Private scheduling and events", ranking_score: 8.8 },
  { url: "https://proton.me/drive", title: "Proton Drive", category: ".me", description: "Encrypted file storage", ranking_score: 8.9 },
  { url: "https://proton.me/vpn", title: "Proton VPN", category: ".me", description: "Secure VPN service", ranking_score: 9.4 },
  { url: "https://proton.me/pass", title: "Proton Pass", category: ".me", description: "Password manager", ranking_score: 8.6 },
  { url: "https://proton.me/wallet", title: "Proton Wallet", category: ".me", description: "Digital wallet", ranking_score: 8.3 },
  { url: "https://www.github.com", title: "GitHub", category: ".com", description: "Code hosting and collaboration", ranking_score: 9.7 }
];

// Specialized "In-Search Engine Sites"
const specializedSites = [
  { title: "YouTube", baseUrl: "https://www.youtube.com/results?search_query=" },
  { title: "Wikipedia", baseUrl: "https://en.wikipedia.org/wiki/" },
  { title: "Oxford English Dictionary", baseUrl: "https://www.oed.com/view/Entry/" }
];

function fuzzyMatch(query, target) {
  const queryLower = query.toLowerCase();
  const targetLower = target.toLowerCase();
  return targetLower.includes(queryLower) || levenshteinDistance(queryLower, targetLower) <= 2;
}

// Levenshtein Distance for fuzzy matching
function levenshteinDistance(a, b) {
  const dp = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }
  return dp[a.length][b.length];
}

async function crawlContent(url, query) {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const bodyText = $("body").text();
    const occurrences = (bodyText.match(new RegExp(query, "gi")) || []).length;
    return occurrences;
  } catch {
    return 0; // Default to 0 if fetching fails
  }
}

// Search API
app.get("/search", async (req, res) => {
  const query = req.query.query?.toLowerCase();
  if (!query) return res.json([]);

  // Specialized Results Handling
  const specialized = specializedSites.find(site => fuzzyMatch(query, site.title));
  if (specialized) {
    return res.json({
      type: "specialized",
      title: specialized.title,
      url: specialized.baseUrl + encodeURIComponent(query)
    });
  }

  // Regular Website Search
  const results = [];
  for (const site of websites) {
    let relevanceScore = 0;
    if (fuzzyMatch(query, site.title)) {
      relevanceScore = 100; // Prioritize exact or fuzzy matches in the title
    } else {
      relevanceScore = await crawlContent(site.url, query); // Check content for matches
    }
    results.push({ ...site, relevanceScore });
  }

  results.sort((a, b) => b.relevanceScore - a.relevanceScore);
  res.json(results);
});

// Start the server
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
