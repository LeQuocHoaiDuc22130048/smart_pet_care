import { useState, useEffect, memo } from 'react';
import { Link, useLocation, NavLink } from 'react-router-dom';
import { ShoppingCart, Sun, Moon, Menu, X, PawPrint, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';

const NAV_LINKS = [
  { to: '/',             label: 'Trang chủ' },
  { to: '/products',     label: 'Sản phẩm' },
  { to: '/services',     label: 'Dịch vụ' },
  { to: '/image-search', label: 'Tìm ảnh' },
  { to: '/profile',      label: 'Tài khoản' },
];

const GREEN = 'rgb(68,139,61)';

export default memo(function Navbar() {
  const { cartCount, darkMode, setDarkMode } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [pathname]);

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled ? 'glass shadow-sm' : 'bg-white/95 dark:bg-neutral-900/95 backdrop-blur-sm'
      }`}
      role="banner"
    >
      <nav className="container-page flex items-center justify-between h-16" aria-label="Main navigation">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-extrabold text-xl tracking-tight" style={{ color: GREEN }} aria-label="PetCare home">
          <motion.div whileHover={{ rotate: [0, -10, 10, 0] }} transition={{ duration: 0.4 }}>
            <PawPrint className="w-7 h-7" />
          </motion.div>
          <span>PetCare</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1" role="list">
          {NAV_LINKS.map(l => (
            <NavLink key={l.to} to={l.to} end={l.to === '/'}
              className={({ isActive }) =>
                `px-4 py-2 text-sm font-medium rounded-full transition-colors duration-200 ${
                  isActive
                    ? 'bg-green-50 dark:bg-green-950/40'
                    : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`
              }
              style={({ isActive }) => isActive ? { color: GREEN } : {}}
              role="listitem"
            >
              {l.label}
            </NavLink>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <Link to="/products"
            className="hidden sm:flex p-2.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-neutral-500 dark:text-neutral-400"
            aria-label="Search products">
            <Search className="w-5 h-5" />
          </Link>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={darkMode ? 'sun' : 'moon'}
                initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}>
                {darkMode
                  ? <Sun  className="w-5 h-5 text-amber-400" />
                  : <Moon className="w-5 h-5 text-neutral-500" />
                }
              </motion.div>
            </AnimatePresence>
          </button>

          <Link to="/cart"
            className="relative p-2.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            aria-label={`Shopping cart, ${cartCount} items`}
          >
            <ShoppingCart className="w-5 h-5 text-neutral-600 dark:text-neutral-300" />
            <AnimatePresence>
              {cartCount > 0 && (
                <motion.span
                  key={cartCount}
                  initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                  className="absolute -top-0.5 -right-0.5 text-white text-[10px] font-bold min-w-[18px] min-h-[18px] rounded-full flex items-center justify-center leading-none px-1"
                  style={{ backgroundColor: GREEN }}
                  aria-hidden="true"
                >
                  {cartCount > 99 ? '99+' : cartCount}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>

          <button
            className="md:hidden p-2.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={menuOpen ? 'x' : 'menu'}
                initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.15 }}>
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </motion.div>
            </AnimatePresence>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden border-t border-neutral-100 dark:border-neutral-800"
          >
            <div className="container-page py-3 flex flex-col gap-1">
              {NAV_LINKS.map(l => (
                <NavLink key={l.to} to={l.to} end={l.to === '/'}
                  className={({ isActive }) =>
                    `px-4 py-2.5 text-sm font-medium rounded-xl transition-colors ${
                      isActive
                        ? 'bg-green-50 dark:bg-green-950/40'
                        : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    }`
                  }
                  style={({ isActive }) => isActive ? { color: GREEN } : {}}
                >
                  {l.label}
                </NavLink>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
});
