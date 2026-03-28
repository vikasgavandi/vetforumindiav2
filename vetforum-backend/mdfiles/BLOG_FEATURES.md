# Blog System - Medium-like Platform for Veterinary Professionals

## 🎯 Overview

The Vet Forum India blog system provides a Medium-like publishing platform where veterinary professionals can share knowledge, case studies, research findings, and industry insights. The system supports both user-generated content and admin-managed editorial content.

---

## 📝 Blog Features

### Core Blog Properties
```json
{
  "id": 1,
  "title": "Advanced Surgical Techniques in Small Animals",
  "subtitle": "Minimally invasive procedures for better patient outcomes",
  "content": "# Introduction\n\nThis comprehensive guide explores...",
  "excerpt": "Learn about cutting-edge surgical methods that improve patient outcomes and reduce recovery time.",
  "featuredImage": "surgery-techniques.jpg",
  "images": ["procedure1.jpg", "procedure2.jpg", "xray-sample.jpg"],
  "tags": ["surgery", "small-animals", "techniques", "minimally-invasive"],
  "readTime": 8,
  "viewsCount": 245,
  "likesCount": 32,
  "commentsCount": 12,
  "status": "published",
  "publishedAt": "2025-01-01T10:00:00.000Z",
  "slug": "advanced-surgical-techniques-small-animals",
  "authorId": 5
}
```

### Auto-Generated Features
- **SEO-Friendly Slugs**: Automatically generated from titles
- **Read Time Estimation**: Calculated at 200 words per minute
- **Auto Excerpts**: First 200 characters if not provided
- **Publication Timestamps**: Set when status changes to published

---

## 🔐 Access Control & Permissions

### User Permissions
| Action | Author | Other Users | Admin |
|--------|--------|-------------|-------|
| Create Blog | ✅ | ❌ | ✅ |
| View Published | ✅ | ✅ | ✅ |
| View Draft | ✅ | ❌ | ✅ |
| Edit Own Blog | ✅ | ❌ | ✅ |
| Edit Any Blog | ❌ | ❌ | ✅ |
| Delete Own Blog | ✅ | ❌ | ✅ |
| Delete Any Blog | ❌ | ❌ | ✅ |
| Like/Comment | ✅ | ✅ | ✅ |

### Status-Based Visibility
- **Draft**: Only visible to author and admins
- **Published**: Visible to all users
- **Archived**: Only visible to author and admins

---

## 📊 API Endpoints

### User Blog APIs

#### Create Blog
```http
POST /api/vetforumindia/v1/blogs
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Emergency Veterinary Procedures: Life-Saving Techniques",
  "subtitle": "Critical procedures every veterinarian should master",
  "content": "# Emergency Medicine\n\nEmergency situations require...",
  "featuredImage": "emergency-vet.jpg",
  "images": ["cpr-technique.jpg", "intubation.jpg"],
  "tags": ["emergency", "procedures", "critical-care"],
  "status": "published"
}
```

#### Get All Blogs
```http
GET /api/vetforumindia/v1/blogs?page=1&limit=10&tags=surgery&search=nutrition&authorId=5
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `status`: Filter by status (published/draft/archived)
- `tags`: Comma-separated tag filter
- `authorId`: Filter by specific author
- `search`: Search in title, subtitle, and content

#### Get Blog by ID/Slug
```http
GET /api/vetforumindia/v1/blogs/123
GET /api/vetforumindia/v1/blogs/advanced-surgical-techniques
```

#### Update Blog
```http
PUT /api/vetforumindia/v1/blogs/123
Authorization: Bearer <token>

{
  "title": "Updated Title",
  "status": "published"
}
```

#### Delete Blog
```http
DELETE /api/vetforumindia/v1/blogs/123
Authorization: Bearer <token>
```

### Blog Interactions

#### Like/Unlike Blog
```http
POST /api/vetforumindia/v1/blogs/123/like
Authorization: Bearer <token>
```

#### Add Comment
```http
POST /api/vetforumindia/v1/blogs/123/comment
Authorization: Bearer <token>

{
  "content": "Excellent article! I've been using similar techniques with great success."
}
```

#### Get Comments
```http
GET /api/vetforumindia/v1/blogs/123/comments?page=1&limit=10
```

### Admin Blog APIs

#### Admin Blog Management
```http
POST /api/vetforumindia/v1/admin/blogs
GET /api/vetforumindia/v1/admin/blogs
GET /api/vetforumindia/v1/admin/blogs/123
PUT /api/vetforumindia/v1/admin/blogs/123
DELETE /api/vetforumindia/v1/admin/blogs/123
Authorization: Bearer <admin_token>
```

---

## 🎨 Content Features

### Rich Text Support
- **Markdown Formatting**: Full markdown support for content
- **Headers**: H1-H6 heading levels
- **Lists**: Ordered and unordered lists
- **Links**: External and internal linking
- **Code Blocks**: Syntax highlighting for code
- **Images**: Inline image embedding
- **Tables**: Data presentation in tabular format

### Media Management
- **Featured Image**: Main article image for previews
- **Image Gallery**: Multiple images within articles
- **Image Metadata**: Alt text and captions support
- **File Upload**: Support for various image formats

### SEO Optimization
- **URL Slugs**: SEO-friendly URLs generated from titles
- **Meta Descriptions**: Excerpts serve as meta descriptions
- **Tag System**: Organized content categorization
- **Structured Data**: Rich snippets for search engines

---

## 📈 Analytics & Engagement

### Engagement Metrics
```json
{
  "viewsCount": 245,
  "likesCount": 32,
  "commentsCount": 12,
  "readTime": 8
}
```

### View Tracking
- **Unique Views**: One view per user per article
- **Author Exclusion**: Authors' views not counted
- **Anonymous Views**: Public articles track anonymous views

### Interaction Analytics
- **Like Patterns**: Track user engagement preferences
- **Comment Quality**: Monitor discussion depth
- **Popular Content**: Identify trending topics

---

## 🔍 Search & Discovery

### Search Capabilities
- **Full-Text Search**: Search across title, subtitle, and content
- **Tag Filtering**: Filter by multiple tags
- **Author Filtering**: Browse specific author's content
- **Status Filtering**: Filter by publication status

### Content Discovery
- **Related Articles**: Tag-based content recommendations
- **Popular Content**: Most viewed and liked articles
- **Recent Publications**: Latest published content
- **Author Profiles**: Discover content by veterinary experts

---

## 📱 Use Case Scenarios

### Scenario 1: Veterinarian Sharing Case Study
```bash
# 1. Create draft article
POST /blogs
{
  "title": "Successful Treatment of Canine Hip Dysplasia",
  "content": "# Case Background...",
  "status": "draft"
}

# 2. Edit and refine content
PUT /blogs/123
{
  "content": "Updated content with more details...",
  "featuredImage": "hip-dysplasia-xray.jpg"
}

# 3. Publish when ready
PUT /blogs/123
{
  "status": "published"
}

# 4. Engage with readers
GET /blogs/123/comments
```

### Scenario 2: Student Learning from Expert Content
```bash
# 1. Search for relevant topics
GET /blogs?search=emergency&tags=procedures

# 2. Read detailed article
GET /blogs/emergency-procedures-guide

# 3. Engage with content
POST /blogs/456/like
POST /blogs/456/comment
{
  "content": "Thank you for this comprehensive guide!"
}
```

### Scenario 3: Admin Content Moderation
```bash
# 1. Review all content
GET /admin/blogs?status=published

# 2. Moderate specific article
GET /admin/blogs/789

# 3. Edit if necessary
PUT /admin/blogs/789
{
  "content": "Moderated content..."
}

# 4. Archive inappropriate content
PUT /admin/blogs/789
{
  "status": "archived"
}
```

---

## 🗄️ Database Schema

### Blog Table
```sql
CREATE TABLE blogs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(200) NOT NULL,
  subtitle VARCHAR(300),
  content LONGTEXT NOT NULL,
  excerpt TEXT,
  featuredImage VARCHAR(255),
  images JSON,
  tags JSON,
  readTime INT,
  viewsCount INT DEFAULT 0,
  likesCount INT DEFAULT 0,
  commentsCount INT DEFAULT 0,
  status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
  publishedAt TIMESTAMP NULL,
  authorId INT NOT NULL,
  slug VARCHAR(255) UNIQUE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (authorId) REFERENCES users(id),
  INDEX idx_status (status),
  INDEX idx_published_at (publishedAt),
  INDEX idx_author_id (authorId),
  INDEX idx_slug (slug)
);
```

### Blog Interactions Table
```sql
CREATE TABLE blog_interactions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  blogId INT NOT NULL,
  type ENUM('like', 'comment', 'view') NOT NULL,
  content TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id),
  FOREIGN KEY (blogId) REFERENCES blogs(id),
  UNIQUE KEY unique_like_view (userId, blogId, type)
);
```

---

## 🚀 Sample Data

### Pre-seeded Blog Articles
1. **Advanced Veterinary Nutrition: A Comprehensive Guide**
   - Status: Published
   - Tags: nutrition, veterinary, health, guide
   - Read Time: ~12 minutes

2. **Emergency Veterinary Procedures: Life-Saving Techniques**
   - Status: Published
   - Tags: emergency, procedures, critical-care
   - Read Time: ~10 minutes

3. **The Future of Veterinary Medicine: Technology and Innovation**
   - Status: Published
   - Tags: technology, innovation, AI, telemedicine
   - Read Time: ~8 minutes

4. **Draft: Upcoming Research in Animal Behavior**
   - Status: Draft
   - Tags: research, behavior, psychology
   - Read Time: ~6 minutes

---

## 🔧 Technical Implementation

### Auto-Generation Features
```javascript
// Slug generation
blog.slug = blog.title
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .substring(0, 100);

// Read time calculation
const wordCount = blog.content.split(/\s+/).length;
blog.readTime = Math.ceil(wordCount / 200);

// Auto excerpt
if (!blog.excerpt) {
  blog.excerpt = blog.content.substring(0, 200) + '...';
}
```

### Performance Optimizations
- **Database Indexing**: Optimized queries for search and filtering
- **Pagination**: Efficient data loading for large datasets
- **Caching**: Frequently accessed content caching
- **Image Optimization**: Compressed images for faster loading

---

## 🛡️ Security Features

### Content Security
- **XSS Prevention**: Sanitized content input
- **SQL Injection Protection**: Parameterized queries
- **Access Control**: Role-based permissions
- **Content Validation**: Input validation and sanitization

### Privacy Controls
- **Draft Privacy**: Private drafts visible only to authors
- **Author Attribution**: Proper content ownership tracking
- **Moderation Tools**: Admin content oversight capabilities

This blog system provides a comprehensive platform for veterinary professionals to share knowledge, engage with peers, and contribute to the veterinary community's collective learning.