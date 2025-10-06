Here's the converted React functional component using TypeScript, styled-components, and functional component practices:

```tsx
import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const Header = styled.header`
  /* Add styles matching the .Header_header__xXQAu class */
`;

const HeaderContainer = styled.div`
  /* Add styles matching the .Header_container__ruOkV class */
`;

const MenuButton = styled(motion.button)`
  /* Add styles matching the .Menu_button__jFLGU class */
  background: transparent;
  border: none;
  cursor: pointer;
`;

const LogoLink = styled.a`
  /* Add styles matching the .Header_logo__eoAf_ class */
`;

const LogoSvg = styled.svg`
  /* Additional styles for Logo SVG if needed */
`;

const HeaderComponent: React.FC = () => {
  const handleMenuToggle = () => {
    // Logic to handle menu open/close can be added here
  };

  return (
    <Header>
      <HeaderContainer>
        <MenuButton onClick={handleMenuToggle}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="7" fill="none">
            <path stroke="currentColor" strokeLinecap="round" strokeWidth="1.88" d="M1 1h14M1 6h14"></path>
          </svg>
        </MenuButton>
        <LogoLink href="/">
          <LogoSvg xmlns="http://www.w3.org/2000/svg" width="60" height="26" fill="none">
            <path fill="currentColor" d="M59.497 19.776c.058.031.142.058.258.09h-4.142l.232-.059c.316-.121.522-.332.638-.606.084-.211.142-.512.142-.876V1.992c0-.453-.084-.786-.232-.997-.116-.179-.405-.364-.87-.511l-.257-.09 3.362-.39.031 18.147c0 .422.027.723.142.997.116.274.348.454.696.633zM9.857 18.81c-.264.2-.554.375-.896.522a7 7 0 0 1-2.809.58c-1.16 0-2.26-.263-3.156-.812-.896-.548-1.623-1.334-2.171-2.32-.554-.986-.817-2.147-.817-3.45 0-1.302.29-2.378.843-3.359.548-.986 1.36-1.74 2.319-2.32a6.5 6.5 0 0 1 3.362-.928c1.017 0 2.17.248 2.808.722-.158-.121-1.36-.548-2.229-.548-1.012 0-1.881.232-2.635.754-.721.49-1.301 1.186-1.707 2.088-.374.87-.58 1.883-.58 3.012 0 1.334.259 2.494.722 3.48.464.987 1.128 1.74 1.94 2.258a4.97 4.97 0 0 0 2.719.785c.811 0 1.507-.21 2.144-.406.069-.02.09-.026.143-.058M42.172 18.307v-9.44c0-.47-.084-.765-.232-.97-.142-.207-.406-.354-.87-.502l-.258-.09 3.305-.38c.058 0 .084.059.084.09v11.292c0 .59.142 1.002.406 1.234.142.116.347.237.637.322h-4.11c.29-.09.49-.206.606-.322.258-.264.432-.649.432-1.234M53.188 19.301q.869.002 1.564-.258c-.115.058-.231.174-.347.232-.754.374-1.592.638-2.493.638a4.75 4.75 0 0 1-2.55-.754c-.78-.49-1.418-1.218-1.913-2.173-.49-.954-.754-2.146-.754-3.539 0-1.392.29-2.52.812-3.507.548-1.012 1.275-1.824 2.203-2.347a6.14 6.14 0 0 1 3.072-.812c.49 0 .954.058 1.36.174-.233-.026-.49-.058-.754-.058-1.36 0-2.461.607-3.304 1.767-.812 1.129-1.244 2.637-1.244 4.462s.432 3.306 1.217 4.435q1.218 1.74 3.13 1.74M21.743 15.645l-.016.015V8.23c0-.296-.09-.512-.232-.65-.116-.115-.406-.236-.87-.331l-.258-.058 3.357-.253.01 4.25a5.96 5.96 0 0 1-1.991 4.467z"></path>
            <path fill="currentColor" d="M39.737 13.245c0 1.43-.78 6.666-6.081 6.666-.548 0-1.044-.058-1.508-.2q.435.088.87.09c5.575 0 5.802-8.533 3.362-10.664-2.45-2.141-4.859-1.456-6.598-.332-.853.548-1.544 1.202-2.007 1.682-.021.016-.037.037-.053.053-1.017 1.065-2.587 3.043-3.452 4.04-.337.39-.521.89-.521 1.408v2.763c0 .274.026.47.142.649s.348.295.696.411c.058.021.142.037.263.058h-4.142l.232-.042c.316-.08.522-.216.638-.396.09-.137.142-.332.142-.57v-1.587c-3.647 3.06-6.619 2.527-7.62 1.678-.753-.639-1.127-1.593-1.127-2.927V8.836c0-.464-.085-.754-.2-.954-.117-.2-.406-.348-.87-.49l-.258-.09 3.388-.375v8.55c0 1.244.29 2.172.896 2.842.469.511 2.334 1.16 4.42-.216.417-.275.865-.596 1.376-1.05.58-.512 1.239-1.197 2.013-2.173.39-.496 2.603-2.99 3.568-4.61.131-.22.247-.447.332-.685.084-.237.137-.485.137-.738a2 2 0 0 0-.095-.675 1 1 0 0 0-.137-.28c-.116-.174-.406-.348-.87-.49l-.258-.09 2.73-.306.627-.068v.965c1.67-1.108 3.373-1.44 5.254-1.081 1.038.195 4.71 1.055 4.71 6.434z"></path>
          </LogoSvg>
        </LogoLink>
      </HeaderContainer>
    </Header>
  );
};

export default HeaderComponent;
```

### Notes:
1. Add the relevant CSS styles from the original CSS file to the styled-components I've created.
2. The `handleMenuToggle` function is a placeholder for any menu toggle functionality you might want to implement.
3. You can replace the animation feature of Framer Motion on the buttons with specific effects based on your needs.
4. Please fill out the CSS styles in the styled components to ensure pixel-perfect matching as per your design specifications.