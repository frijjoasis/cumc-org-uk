import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import {
  Shield,
  Scale,
  Heart,
  Lock,
  Scroll,
  BookOpen,
  AlertCircle,
} from 'lucide-react';

// Document Content Imports
import { safetyAbout } from './safety';
import { codeOfConductAbout } from './codeOfConduct';
import { dataAbout } from './privacy';
import { constitutionAbout } from './constitution';
import { welfareAbout } from './welfare';
import { wherryDonationPolicy } from './wherryDonationPolicy';
import { covidAbout } from './covid';

const DocumentsAbout = () => {
  const [activeDoc, setActiveDoc] = useState('safety');

  const docs = [
    {
      id: 'safety',
      title: 'Safety Policy',
      icon: Shield,
      content: safetyAbout,
    },
    {
      id: 'conduct',
      title: 'Code of Conduct',
      icon: Scale,
      content: codeOfConductAbout,
    },
    {
      id: 'welfare',
      title: 'Welfare Policy',
      icon: Heart,
      content: welfareAbout,
    },
    { id: 'privacy', title: 'Privacy Policy', icon: Lock, content: dataAbout },
    {
      id: 'constitution',
      title: 'Constitution',
      icon: Scroll,
      content: constitutionAbout,
    },
    {
      id: 'wherry',
      title: 'Wherry Donations',
      icon: BookOpen,
      content: wherryDonationPolicy,
    },
    {
      id: 'covid',
      title: 'COVID Guidelines',
      icon: AlertCircle,
      content: covidAbout,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto pb-20 px-4 pt-8">
      {/* Header */}
      <div className="mb-10 border-b border-zinc-100 pb-8">
        <h1 className="text-4xl font-black uppercase tracking-tighter text-zinc-900">
          Governance
        </h1>
        <p className="text-zinc-500 font-medium mt-1">
          Official CUMC policies and legal documents.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className=" w-full">
          <Accordion type="single" collapsible className="space-y-3">
            {docs.map(doc => (
              <AccordionItem
                key={doc.id}
                value={doc.id}
                className="border border-zinc-200 rounded-xl px-2 bg-white"
              >
                <AccordionTrigger className="hover:no-underline py-4 px-2">
                  <div className="flex items-center gap-3">
                    <doc.icon className="h-4 w-4 text-primary" />
                    <span className="font-bold text-zinc-900 text-sm">
                      {doc.title}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-6 px-2">
                  <div className="legacy-document-render">{doc.content}</div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>

      <style>{`
        .legacy-document-render {
          color: #3f3f46; /* zinc-700 */
          line-height: 1.6;
        }
        /* Fix headings in the array */
        .legacy-document-render h1, 
        .legacy-document-render h2 { 
          font-size: 1.5rem; 
          font-weight: 900; 
          text-transform: uppercase; 
          letter-spacing: -0.025em;
          color: #18181b; /* zinc-900 */
          margin-bottom: 1rem;
        }
        .legacy-document-render h3 {
          font-size: 1.125rem;
          font-weight: 800;
          color: #18181b;
          margin-top: 1.5rem;
          margin-bottom: 0.5rem;
        }
        /* Restore the numbers in the Constitution/Code of Conduct */
        .legacy-document-render ol {
          list-style: decimal outside;
          padding-left: 1.5rem;
          margin: 1rem 0;
        }
        .legacy-document-render ul {
          list-style: disc outside;
          padding-left: 1.5rem;
          margin: 1rem 0;
        }
        .legacy-document-render li {
          margin-bottom: 0.75rem;
        }
        /* Flatten the extra <br> tags in your files to avoid massive gaps */
        .legacy-document-render br {
          content: "";
          display: block;
          margin-top: 0.5rem;
        }
        /* Handle links inside docs */
        .legacy-document-render a {
          color: #3b82f6; /* primary blue */
          font-weight: 600;
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

export default DocumentsAbout;
