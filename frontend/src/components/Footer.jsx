import React from "react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="app-footer">
      <p>© {currentYear} Canvas. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
