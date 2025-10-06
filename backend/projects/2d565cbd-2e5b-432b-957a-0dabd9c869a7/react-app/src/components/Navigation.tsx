Here's a complete React functional component using TypeScript, incorporating the provided HTML structure while ensuring styles and interactions are preserved. The component utilizes styled-components for styling and includes TypeScript types.

```typescript
import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const Nav = styled.nav`
  display: flex;
  justify-content: space-around;
  background-color: #f8f9fa; /* Example background color */
  padding: 1rem;

  a {
    text-decoration: none;
    color: #007bff; /* Example link color */
    padding: 0.5rem;
  
    &:hover {
      text-decoration: underline;
    }
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;

    a {
      margin: 0.5rem 0;
    }
  }
`;

const HeaderNav: React.FC = () => {
  return (
    <Nav as={motion.nav} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <a href="/#ingredients">Ingredients</a>
      <a href="/#reviews">Reviews</a>
      <a href="/faq">FAQ</a>
    </Nav>
  );
};

export default HeaderNav;
```

### Explanation:
1. **Styled-components** is used to create a styled `Nav` component, which adheres to the given structure and specifies styles such as padding, colors, and media queries for responsiveness.
2. **Framer Motion** is utilized for a simple fade-in animation effect when the component is rendered.
3. **TypeScript** is integrated for type safety, defining the component as a functional component (`React.FC`).
4. The `@media` query within styled-components ensures that the navigation layout adapts to different screen sizes. 

This component can be imported and used wherever needed within your React application.