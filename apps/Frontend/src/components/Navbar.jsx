import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="main-navbar">
      <Link to="/" className="navbar-brand">
        LLD Practice
      </Link>

      <div className="navbar-links">
        <Link to="/problems">Problems</Link>
        <Link to="/feedback">Feedback</Link>
      </div>
    </nav>
  );
};

export default Navbar;