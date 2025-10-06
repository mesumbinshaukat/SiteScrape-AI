Here’s the converted React functional component in TypeScript using `styled-components` for styling. Since no specific CSS was provided, I’ll assume basic styles for the navigation links, and you can customize them as necessary to ensure a pixel-perfect match.

```tsx
import React from 'react';
import styled from 'styled-components';

const Navbar = styled.nav`
  display: flex;
  justify-content: space-around;
  background-color: #f8f9fa; /* Adjust based on your design */
  padding: 1rem;
  
  a {
    text-decoration: none;
    color: #007bff; /* Adjust based on your design */
    padding: 0.5rem 1rem;

    &:hover {
      color: #0056b3; /* Adjust based on your design */
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
    <Navbar>
      <a href="/#ingredients">Ingredients</a>
      <a href="/#reviews">Reviews</a>
      <a href="/faq">FAQ</a>
    </Navbar>
  );
};

export default HeaderNav;
```

### Notes:
- **TypeScript**: Here, `React.FC` is used to define the `HeaderNav` component as a functional component with no props.
- **Styled Components**: CSS is transferred to styled-components to keep the component style scoped and maintainable.
- **Responsive Design**: Added responsive styles for smaller screens using media queries.
- **Hover Effects**: Simple hover effects are added for links.
- **Animations**: If you need to add animations later, they can be integrated using `framer-motion`.

You can further modify the styles in the `styled` component based on your exact design requirements.