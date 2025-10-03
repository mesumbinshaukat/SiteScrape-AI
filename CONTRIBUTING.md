# Contributing to SiteScape AI

Thank you for your interest in contributing to SiteScape AI! This document provides guidelines for contributing to the project.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB
- Git
- Code editor (VS Code recommended)

### Setup Development Environment
```bash
# Clone the repository
git clone <repository-url>
cd theme-extracter-tool-wordpress

# Install dependencies
npm run install:all

# Copy environment file
cp .env.example .env

# Add your OpenRouter API key to .env
# Start MongoDB
net start MongoDB

# Run in development mode
npm run dev
```

## 📝 Development Workflow

### 1. Create a Branch
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

### 2. Make Changes
- Write clean, readable code
- Follow existing code style
- Add comments for complex logic
- Update documentation if needed

### 3. Test Your Changes
```bash
# Run backend tests
cd backend
npm test

# Manual testing
npm run dev
```

### 4. Commit Changes
```bash
git add .
git commit -m "feat: add new feature"
# or
git commit -m "fix: resolve bug"
```

### Commit Message Format
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting)
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks

### 5. Push and Create Pull Request
```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

## 🎨 Code Style Guidelines

### TypeScript
- Use TypeScript for all new code
- Define proper types and interfaces
- Avoid `any` type when possible
- Use async/await instead of callbacks

### Naming Conventions
- **Files**: camelCase for utilities, PascalCase for components
- **Variables**: camelCase
- **Constants**: UPPER_SNAKE_CASE
- **Classes**: PascalCase
- **Interfaces**: PascalCase with 'I' prefix

### Example
```typescript
// Good
interface IUserData {
  userId: string;
  userName: string;
}

const API_BASE_URL = 'http://localhost:5000';

class UserService {
  async getUserData(userId: string): Promise<IUserData> {
    // implementation
  }
}

// Bad
interface userdata {
  id: string;
  name: string;
}

const apiUrl = 'http://localhost:5000';
```

## 🧪 Testing Guidelines

### Writing Tests
- Write tests for new features
- Maintain test coverage above 70%
- Use descriptive test names
- Test edge cases

### Test Structure
```typescript
describe('FeatureName', () => {
  describe('functionName', () => {
    it('should do something specific', () => {
      // Arrange
      const input = 'test';
      
      // Act
      const result = functionName(input);
      
      // Assert
      expect(result).toBe('expected');
    });
  });
});
```

## 📚 Documentation

### Code Documentation
- Add JSDoc comments for functions
- Document complex algorithms
- Explain non-obvious code

### Example
```typescript
/**
 * Scrapes a website and extracts all assets
 * @param url - The URL to scrape
 * @param options - Scraping options
 * @returns Promise with scraped data
 * @throws Error if URL is invalid or scraping fails
 */
async function scrapeWebsite(url: string, options?: ScrapeOptions): Promise<ScrapedData> {
  // implementation
}
```

### README Updates
- Update README.md for new features
- Add examples for new functionality
- Update installation steps if needed

## 🐛 Bug Reports

### Before Submitting
- Check if the bug is already reported
- Try to reproduce the bug
- Gather relevant information

### Bug Report Template
```markdown
**Description**
Clear description of the bug

**Steps to Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
What should happen

**Actual Behavior**
What actually happens

**Environment**
- OS: Windows 11
- Node.js: v18.0.0
- MongoDB: v8.0.0

**Screenshots**
If applicable

**Additional Context**
Any other relevant information
```

## ✨ Feature Requests

### Feature Request Template
```markdown
**Feature Description**
Clear description of the feature

**Use Case**
Why is this feature needed?

**Proposed Solution**
How should it work?

**Alternatives Considered**
Other approaches you've thought about

**Additional Context**
Mockups, examples, etc.
```

## 🔍 Code Review Process

### For Contributors
- Respond to review comments
- Make requested changes
- Keep PR focused and small
- Update PR description if scope changes

### For Reviewers
- Be respectful and constructive
- Explain why changes are needed
- Approve when ready
- Test the changes locally

## 🏗️ Project Structure

### Adding New Features

#### Backend Service
```typescript
// backend/src/services/newService.ts
export class NewService {
  async doSomething(): Promise<void> {
    // implementation
  }
}

export default new NewService();
```

#### API Route
```typescript
// backend/src/routes/newRoutes.ts
import { Router } from 'express';

const router = Router();

router.post('/endpoint', async (req, res) => {
  // implementation
});

export default router;
```

#### Frontend Component
```typescript
// frontend/src/components/NewComponent.tsx
import React from 'react';

interface Props {
  // props
}

const NewComponent: React.FC<Props> = ({ }) => {
  return <div>Component</div>;
};

export default NewComponent;
```

## 🔧 Development Tips

### Debugging
```typescript
// Use debug logs
console.log('[DEBUG]', 'Variable:', variable);

// Use breakpoints in VS Code
// Add to launch.json for debugging
```

### MongoDB Queries
```bash
# View data
mongosh
use sitescape-ai
db.scrapes.find().pretty()
```

### Testing API Endpoints
```bash
# Using curl
curl -X POST http://localhost:5000/api/scrape \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com"}'

# Using Postman or Thunder Client
```

## 📦 Dependencies

### Adding Dependencies
```bash
# Backend
cd backend
npm install package-name
npm install -D @types/package-name

# Frontend
cd frontend
npm install package-name
```

### Dependency Guidelines
- Use stable versions
- Check bundle size impact
- Verify license compatibility
- Document why dependency is needed

## 🚢 Release Process

### Version Numbering
Follow Semantic Versioning (semver):
- MAJOR: Breaking changes
- MINOR: New features (backward compatible)
- PATCH: Bug fixes

### Release Checklist
- [ ] All tests pass
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Version bumped in package.json
- [ ] Git tag created
- [ ] Release notes written

## 🤝 Community Guidelines

### Code of Conduct
- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Help others learn

### Communication
- Use clear, concise language
- Be patient with questions
- Share knowledge
- Celebrate contributions

## 📞 Getting Help

### Resources
- GitHub Issues: Bug reports and features
- Discussions: Questions and ideas
- Documentation: README.md and PROJECT_INFO.md

### Contact
- Create an issue for bugs
- Start a discussion for questions
- Tag maintainers for urgent issues

## 🎯 Priority Areas

### High Priority
- Bug fixes
- Security improvements
- Performance optimizations
- Documentation improvements

### Medium Priority
- New features
- UI/UX enhancements
- Test coverage
- Code refactoring

### Low Priority
- Nice-to-have features
- Experimental features
- Design improvements

## 📋 Checklist for Pull Requests

- [ ] Code follows project style guidelines
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] Commit messages are clear
- [ ] No console.log in production code
- [ ] TypeScript types are proper
- [ ] Error handling is implemented
- [ ] Code is commented where needed
- [ ] PR description is complete

## 🙏 Thank You!

Your contributions make SiteScape AI better for everyone. We appreciate your time and effort!

---

**Questions?** Open an issue or start a discussion!
