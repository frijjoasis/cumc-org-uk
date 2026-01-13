import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface AboutCardProps {
  title: string;
  text: string | React.ReactNode;
  button?: {
    type?: 'button' | string;
    to: string;
    text: string;
  };
}

const AboutCard = ({ title, text, button }: AboutCardProps) => {
  return (
    <div className="w-full">
      <Card className="shadow-md overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl font-bold">{title}</CardTitle>
          <div className="h-[1px] bg-border mt-2" />
        </CardHeader>

        <CardContent>
          <div className="text-muted-foreground leading-relaxed">{text}</div>
        </CardContent>

        {button && (
          <CardFooter className="flex justify-end bg-muted/50 p-4 border-t">
            <Button
              asChild
              variant={button.type === 'button' ? 'outline' : 'default'}
            >
              <Link to={button.to}>{button.text}</Link>
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default AboutCard;
