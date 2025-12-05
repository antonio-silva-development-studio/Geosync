import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface ContextMenuItem {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  danger?: boolean;
}

interface ContextMenuProps {
  children: React.ReactNode;
  items: ContextMenuItem[];
  className?: string;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ children, items, className }) => {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setVisible(false);
      }
    };

    const handleScroll = () => {
      if (visible) setVisible(false);
    };

    if (visible) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('scroll', handleScroll, true);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [visible]);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Calculate position to keep menu within viewport
    let x = e.clientX;
    let y = e.clientY;

    // Adjust if close to right edge (assuming menu width ~200px)
    if (x + 200 > window.innerWidth) {
      x = window.innerWidth - 210;
    }

    // Adjust if close to bottom edge (assuming menu height ~items * 40px)
    const estimatedHeight = items.length * 40 + 20;
    if (y + estimatedHeight > window.innerHeight) {
      y = window.innerHeight - estimatedHeight;
    }

    setPosition({ x, y });
    setVisible(true);
  };

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: context menu trigger
    <div onContextMenu={handleContextMenu} className={className}>
      {children}
      {visible &&
        createPortal(
          <div
            ref={menuRef}
            className="fixed z-50 min-w-[160px] overflow-hidden rounded-md border bg-white p-1 shadow-lg dark:border-gray-700 dark:bg-gray-800"
            style={{ top: position.y, left: position.x }}
          >
            {items.map((item) => (
              <button
                type="button"
                key={item.label}
                onClick={(e) => {
                  e.stopPropagation();
                  item.onClick();
                  setVisible(false);
                }}
                className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm text-left ${
                  item.danger
                    ? 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {item.icon && <span className="h-4 w-4">{item.icon}</span>}
                {item.label}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </div>
  );
};
