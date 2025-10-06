Here's the converted HTML/CSS/JS code into a React functional component using TypeScript and styled-components while ensuring it aligns with your requirements:

```tsx
import React from 'react';
import styled from 'styled-components';
import { FaFacebookF, FaLinkedinIn, FaInstagram } from 'react-icons/fa';

const FooterContainer = styled.footer`
  background-color: #343a40;
  color: white;
  padding: 3rem 0;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: auto;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
`;

const FooterSection = styled.div`
  flex: 1;
  min-width: 250px;
`;

const FooterLogo = styled.div`
  margin-bottom: 1rem;
`;

const FooterDescription = styled.p`
  margin-bottom: 1rem;
`;

const SocialLinks = styled.div`
  a {
    color: white;
    margin-right: 1rem;
    font-size: 1.5rem;
    &:hover {
      color: #007bff;
    }
  }
`;

const FooterTitle = styled.h5`
  margin-bottom: 1rem;
`;

const FooterLinks = styled.ul`
  list-style: none;
  padding: 0;
  a {
    color: white;
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }
`;

const Footer: React.FC = () => {
  return (
    <FooterContainer>
      <Container>
        {/* Company Info */}
        <FooterSection>
          <FooterLogo>
            <img src="logo/envision-expert-logo-dark (1).png" alt="EnvisionXperts" height="50" />
          </FooterLogo>
          <FooterDescription>
            EnvisionXperts is a leading web development company specializing in PHP-based solutions,
            mobile applications, and digital transformation services. We help businesses achieve their
            digital goals with innovative and scalable solutions.
          </FooterDescription>
          <SocialLinks>
            <a href="https://www.facebook.com/envisionxperts" aria-label="Facebook"><FaFacebookF /></a>
            <a href="https://pk.linkedin.com/company/envisionxperts" aria-label="LinkedIn"><FaLinkedinIn /></a>
            <a href="https://www.instagram.com/envisionxperts/" aria-label="Instagram"><FaInstagram /></a>
          </SocialLinks>
        </FooterSection>

        {/* Quick Links */}
        <FooterSection>
          <FooterTitle>Quick Links</FooterTitle>
          <FooterLinks>
            <li><a href="index.php">Home</a></li>
            <li><a href="about.php">About Us</a></li>
            <li><a href="services.php">Services</a></li>
            <li><a href="portfolio.php">Portfolio</a></li>
            <li><a href="blog.php">Blog</a></li>
            <li><a href="contact.php">Contact</a></li>
          </FooterLinks>
        </FooterSection>

        {/* Services */}
        <FooterSection>
          <FooterTitle>Our Services</FooterTitle>
          <FooterLinks>
            <li><a href="services.php#web-development">Web Development</a></li>
            <li><a href="services.php#mobile-development">Mobile App Development</a></li>
            <li><a href="services.php#software-development">Software Development</a></li>
            <li><a href="services.php#digital-transformation">Digital Transformation</a></li>
            <li><a href="services.php#it-consulting">IT Consulting</a></li>
            <li><a href="services.php#digital-marketing">Digital Marketing &amp; SEO</a></li>
          </FooterLinks>
        </FooterSection>
        
        {/* Additional Sections can be added here */}
      </Container>
    </FooterContainer>
  );
};

export default Footer;
```

### Notes:
1. **Styled-Components**: Used for styling the footer while maintaining the original styles.
2. **React Icons**: Integrated for social media icons.
3. **Responsive Design**: The component uses a flexible box layout to ensure responsiveness.
4. **TypeScript**: The component is typed using TypeScript, and the props interface can be added as needed.
5. **Accessibility**: Added `aria-label` for social links to improve accessibility.

The code above reflects the original structure and style of the footer you provided while conforming to modern React practices.