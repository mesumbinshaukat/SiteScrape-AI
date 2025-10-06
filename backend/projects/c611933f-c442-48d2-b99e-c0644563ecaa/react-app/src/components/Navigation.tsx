Here is the React functional component code converted from the provided HTML, CSS, and JS, using TypeScript and styled-components:

```tsx
import React from 'react';
import styled from 'styled-components';

const Nav = styled.nav`
  display: flex;
  justify-content: space-around;
  padding: 1rem;
  background-color: #f8f8f8;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
  }
`;

const NavLink = styled.a`
  text-decoration: none;
  color: #333;
  font-size: 1rem;
  padding: 0.5rem 1rem;
  transition: color 0.3s;

  &:hover {
    color: #0070f3;
  }
`;

const Header: React.FC = () => {
  return (
    <Nav>
      <NavLink href="/#ingredients">Ingredients</NavLink>
      <NavLink href="/#reviews">Reviews</NavLink>
      <NavLink href="/faq">FAQ</NavLink>
    </Nav>
  );
};

export default Header;
```

### Explanation:

1. **Styled-Components**: The `Nav` and `NavLink` styled components are created to handle styles similar to the provided CSS. Media queries are added to make it responsive.
2. **TypeScript**: The component uses TypeScript's `React.FC` for type-checking the functional component.
3. **Base Link Styles**: Basic link styles are applied with hover effects, simulating interactivity as mentioned in the requirements.
4. **Responsive Design**: Media queries are incorporated for responsiveness.
5. **No animations were needed** based on the given code, but `Framer Motion` could be added if desired in the future. 

This component should match the original UI's style and interactions while adhering to the specified requirements.