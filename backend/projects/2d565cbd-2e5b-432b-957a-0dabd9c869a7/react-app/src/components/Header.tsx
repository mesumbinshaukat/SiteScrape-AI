Here’s the converted code to a React functional component with TypeScript, utilizing styled-components for styling. Note that I've provided type definitions to align with TypeScript best practices.

```tsx
import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const HeaderWrapper = styled.header`
  /* Replace this with your actual styles */
  display: flex;
  justify-content: center;
  background-color: #FFFFFF;
  /* Add additional styles here */
`;

const Container = styled.div`
  /* Replace this with your actual styles */
  display: flex;
  align-items: center;
  padding: 1rem;
  /* Add additional styles here */
`;

const MenuButton = styled.button`
  /* Replace this with your actual styles */
  background: transparent;
  border: none;
  cursor: pointer;
  /* Add additional styles here */
`;

const LogoLink = styled.a`
  /* Replace this with your actual styles */
  display: flex;
  align-items: center;
  text-decoration: none;
  /* Add additional styles here */
`;

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState<boolean>(false);

  const toggleMenu = () => {
    setIsMenuOpen(prev => !prev);
  };

  return (
    <HeaderWrapper>
      <Container>
        <MenuButton onClick={toggleMenu}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="7" fill="none">
            <path stroke="currentColor" strokeLinecap="round" strokeWidth="1.88" d="M1 1h14M1 6h14"></path>
          </svg>
        </MenuButton>
        <LogoLink href="/">
          <svg xmlns="http://www.w3.org/2000/svg" width="60" height="26" fill="none">
            <path fill="currentColor" d="M59.497 19.776c.058.031.142.058.258.09h-4.142l.232-.059c.316-.121.522-.332.638-.606.084-.211.142-.512.142-.876V1.992c0-.453-.084-.786-.232-.997-.116-.179-.405-.364-.87-.511l-.257-.09 3.362-.39.031 18.147c0 .422.027.723.142.997.116.274.348.454.696.633zM9.857 18.81c-.264.2-.554.375-.896.522a7 7 0 0 1-2.809.58c-1.16 0-2.26-.263-3.156-.812-.896-.548-1.623-1.334-2.171-2.32-.554-.986-.817-2.147-.817-3.45 0-1.302.29-2.378.843-3.359.548-.986 1.36-1.74 2.319-2.32a6.5 6.5 0 0 1 3.362-.928c1.017 0 2.17.248 2.808.722-.158-.121-1.36-.548-2.229-.548-1.012 0-1.881.232-2.635.754-.721.49-1.301 1.186-1.707 2.088-.374.87-.58 1.883-.58 3.012 0 1.334.259 2.494.722 3.48.464.987 1.128 1.74 1.94 2.258a4.97 4.97 0 0 0 2.719.785c.811 0 1.507-.21 2.144-.406.069-.02.09-.026.143-.058M42.172 18.307v-9.44c0-.47-.084-.765-.232-.97-.142-.207-.406-.354-.87-.502l-.258-.09 3.305-.38c.058 0 .084.059.084.09v11.292c0 .59.142 1.002.406 1.234.142.116.347.237.637.322h-4.11c.29-.09.49-.206.606-.322.258-.264.432-.649.432-1.234M53.188 19.301q.869.002 1.564-.258c-.115.058-.231.174-.347.232-.754.374-1.592.638-2.493.638a4.75 4.75 0 0 1-2.55-.754c-.78-.49-1.418-1.218-1.913-2.173-.49-.954-.754-2.146-.754-3.539 0-1.392.29-2.52.812-3.507.548-1.012 1.275-1.824 2.203-2.347a6.14 6.14 0 0 1 3.072-.812c.49 0 .954.058 1.36.174-.233-.026-.49-.058-.754-.058-1.36 0-2.461.607-3.304 1.767-.812 1.129-1.244 2.637-1.244 4.462s.432 3.306 1.217 4.435q1.218 1.74 3.13 1.74M21.743 15.645l-.016.015V8.23c0-.296-.09-.512-.232-.65-.116-.115-.406-.236-.87-.331l-.258-.058 3.357-.253.01 4.25a5.96 5.96 0 0 1-1.991 4.467z"></path>
            {/* The svg path continues here */}
          </svg>
        </LogoLink>
      </Container>
    </HeaderWrapper>
  );
};

export default Header;
```

### Notes:
1. The CSS part is empty in your request; please replace the comments in the styled-components with your actual CSS styles.
2. The JS logic provided didn’t contain any complex state or effect handling, so I simply added a state for toggling a menu.
3. You may need to further extend the animations with Framer Motion if interactions are needed based on your specific requirements.
4. Ensure you install `styled-components` and `framer-motion` in your project if you haven't done so already.