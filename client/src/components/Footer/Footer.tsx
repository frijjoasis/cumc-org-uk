import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const Footer = () => {
  const [link, setLink] = useState('https://www.cumc.org.uk/login');

  useEffect(() => {
    axios.get<string>('/api/about/whatsapp').then(res => {
      setLink(res.data);
    });
  }, []);

  return (
    <footer className="w-full py-3 border-t bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto flex justify-center">
        <nav>
          <ul className="flex items-center gap-6">
            <li>
              <a
                href="https://www.facebook.com/cumcofficial/"
                className="text-zinc-600 hover:text-blue-700 transition-colors"
                aria-label="Facebook"
              >
                <i className="fa fa-facebook-square text-2xl" />
              </a>
            </li>
            <li>
              <a
                href="https://www.instagram.com/cumcofficial"
                className="text-zinc-600 hover:text-pink-600 transition-colors"
                aria-label="Instagram"
              >
                <i className="fa fa-instagram text-2xl" />
              </a>
            </li>
            <li>
              <a
                href={link}
                className="text-zinc-600 hover:text-green-600 transition-colors"
                aria-label="WhatsApp"
              >
                <i className="fa fa-whatsapp text-2xl" />
              </a>
            </li>
            <li>
              <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a
                      href="https://github.com/frijjoasis/cumc-org-uk"
                      className="text-zinc-600 hover:text-zinc-900 transition-colors"
                      aria-label="GitHub"
                    >
                      <i className="fa fa-github text-2xl" />
                    </a>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p className="font-semibold text-xs">Made by Edmund</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
