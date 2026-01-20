import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  ExternalLink,
  GraduationCap,
  BookOpen,
  Link as LinkIcon,
} from 'lucide-react';
import { resources } from './text';

const ResourcesAbout = () => {
  return (
    <div className="space-y-8 pb-12 max-w-6xl mx-auto px-4 md:px-0">
      {/* Header Section */}
      <div className="space-y-2 text-center md:text-left">
        <h2 className="text-4xl font-black uppercase tracking-tighter text-zinc-900 flex items-center justify-center md:justify-start gap-3">
          <GraduationCap className="h-10 w-10 text-primary" />
          Resources
        </h2>
        <p className="text-zinc-500 font-bold uppercase tracking-widest text-sm">
          Skills, Training & Education
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {resources.map((res, idx) => (
          <Card
            key={idx}
            className="border-none shadow-md hover:shadow-xl transition-all group bg-white flex flex-col"
          >
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start gap-4">
                <CardTitle className="text-xl font-black uppercase tracking-tight text-zinc-900 leading-tight">
                  {res.title}
                </CardTitle>
                {res.link && (
                  <a
                    href={res.link}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 bg-zinc-100 rounded-full text-zinc-400 group-hover:text-primary group-hover:bg-primary/10 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
            </CardHeader>
            <CardContent className="grow space-y-4">
              <p className="text-zinc-600 font-medium text-sm leading-relaxed">
                {res.description}
              </p>

              {res.extraLinks && (
                <div className="pt-4 border-t border-zinc-100">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3 block">
                    Quick Links
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {res.extraLinks.map((sub, sIdx) => (
                      <a
                        key={sIdx}
                        href={sub.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 text-xs font-bold rounded-md border border-zinc-200 transition-colors"
                      >
                        <BookOpen className="h-3 w-3 text-primary" />
                        {sub.label}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Internal Help Footer */}
      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-8 text-center mt-12">
        <h3 className="font-black text-zinc-900 uppercase tracking-tight mb-2">
          Can't find what you're looking for?
        </h3>
        <p className="text-zinc-600 text-sm font-medium">
          Get in touch with the committee or check out our physical library at
          the next gear tea!
        </p>
      </div>
    </div>
  );
};

export default ResourcesAbout;
