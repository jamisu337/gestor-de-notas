import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import './styles.css';

export default function CustomSelect({ value, onChange, options, placeholder, style }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(o => o.value === value);

  return (
    <div className="custom-select-container" ref={containerRef} style={style}>
      <div 
        className={`custom-select-header ${isOpen ? 'open' : ''} ${!selectedOption ? 'is-placeholder' : ''}`} 
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown size={16} className={`custom-select-icon ${isOpen ? 'open' : ''}`} />
      </div>
      
      {isOpen && (
        <div className="custom-select-dropdown">
          <div 
            className="custom-select-option placeholder"
            onClick={() => { onChange(''); setIsOpen(false); }}
          >
            {placeholder}
          </div>
          {options.map(opt => (
            <div 
              key={opt.value}
              className={`custom-select-option ${value === opt.value ? 'selected' : ''}`}
              onClick={() => { onChange(opt.value); setIsOpen(false); }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
