// frontend/src/components/layout/Footer.jsx
import { Heart } from 'lucide-react';

const Footer = ({ isCollapsed }) => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className={`bg-white dark:bg-gray-800 border-t border-border py-4 px-6 ${
      isCollapsed ? 'ml-16' : 'ml-64'
    } transition-all duration-300`}>
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div className="mb-2 md:mb-0">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            &copy; {currentYear} MediSupply. Todos los derechos reservados.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600 dark:text-gray-300 flex items-center">
            Desarrollado con <Heart size={14} className="text-red-500 mx-1" /> por Equipo Desarrollo
          </span>
          <div className="flex gap-3">
            <a href="#" className="text-gray-500 hover:text-primary transition-colors">
              Ayuda
            </a>
            <a href="#" className="text-gray-500 hover:text-primary transition-colors">
              Privacidad
            </a>
            <a href="#" className="text-gray-500 hover:text-primary transition-colors">
              Términos
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;