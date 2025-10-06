Here's a React functional component converted from the provided HTML/CSS/JS code with TypeScript:

```tsx
import React, { useEffect } from 'react';
import styled from 'styled-components';

// Styled-components for styling the navbar
const Navbar = styled.header`
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 1030;
  background-color: var(--bs-dark);
  transition: background-color 0.5s ease;
  &.scrolled {
    background-color: rgba(0, 0, 0, 0.8);
  }
`;

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 15px;
`;

const Brand = styled.a`
  img {
    height: 40px;
  }
`;

const NavbarToggler = styled.button`
  background: none;
  border: none;
  cursor: pointer;
`;

const NavMenu = styled.div`
  display: flex;

  @media (max-width: 768px) {
    display: none;
  }
`;

const NavItem = styled.li`
  list-style: none;

  .nav-link {
    color: white;
    text-decoration: none;
    padding: 0 15px;
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  display: none;
  flex-direction: column;

  &.show {
    display: flex;
  }
`;

const MegaMenuSection = styled.div`
  margin: 10px 0;
`;

const Navbar: React.FC = () => {
  const handleScroll = () => {
    const navbar = document.getElementById('mainNav');
    if (navbar) {
      if (window.scrollY > 10) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <Navbar className="navbar navbar-expand-lg navbar-dark" id="mainNav">
      <Container>
        <Brand href="index.php">
          <img src="logo/envision-expert-logo-dark (1).png" alt="EnvisionXperts" />
        </Brand>
        <NavbarToggler
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </NavbarToggler>
        <div className="collapse navbar-collapse" id="navbarNav">
          <NavMenu className="navbar-nav me-auto">
            <NavItem>
              <a className="nav-link" href="index.php">Home</a>
            </NavItem>
            <NavItem>
              <a className="nav-link" href="about.php">About</a>
            </NavItem>
            <NavItem className="dropdown position-static">
              <a
                className="nav-link dropdown-toggle"
                href="#"
                id="servicesDropdown"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Services
              </a>
              <DropdownMenu className="dropdown-menu mega-menu" aria-labelledby="servicesDropdown">
                <div className="container">
                  <div className="row g-4">
                    <div className="col-lg-3 col-md-6">
                      <MegaMenuSection>
                        <h5><i className="fas fa-globe me-2"></i>Web Development</h5>
                        <ul className="mega-menu-list">
                          <li><a href="services/custom-php.php">Custom PHP Development</a></li>
                          <li><a href="services/cms-development.php">CMS Development</a></li>
                          <li><a href="services/ecommerce.php">eCommerce Solutions</a></li>
                          <li><a href="services/web-modernization.php">Web Modernization</a></li>
                          <li><a href="services/pwa.php">Progressive Web Apps</a></li>
                          <li><a href="services/api-development.php">API Development</a></li>
                          <li><a href="services/web-maintenance.php">Web Maintenance</a></li>
                        </ul>
                      </MegaMenuSection>
                    </div>
                    {/* Additional sections can be added similarly */}
                  </div>
                </div>
              </DropdownMenu>
            </NavItem>
          </NavMenu>
        </div>
      </Container>
    </Navbar>
  );
};

export default Navbar;
```

### Key Components Explained:
- **Styled-components**: The CSS styles are translated into styled components, providing scoped styles to the Navbar.
- **Scroll Effect**: Added an event listener to handle the scroll event for changing navbar styles based on the scroll position.
- **Types**: The component is defined using TypeScript (`React.FC` for function component).
- **Responsive Design**: Made use of media queries to hide the navigation items appropriately on smaller devices.

You can add further functionality and styles based on additional requirements or components as needed.