"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

export type TextVariant = "title" | "headline" | "subheadline" | "normal" | "small" | "bullet" | "number";
export type ShapeVariant = "rectangle" | "circle" | "triangle" | "line";

type ToolBarProps = {
  gridView: boolean;
  addTextNow: (variant: TextVariant) => void;
  addShape: (variant: ShapeVariant) => void;
};

export function ToolBar({ gridView, addTextNow, addShape }: ToolBarProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (gridView) return null;
  const portalTarget = mounted ? document.body : null;
  if (!portalTarget) return null;
  return createPortal(
    <div className="fixed left-1/2 -translate-x-1/2 top-3 z-[10000] pointer-events-auto" aria-label="Tool bar">
      <div className="flex items-center gap-8 rounded-[28px] px-4 py-2">
        {/* Helper components to animate menus */}
        {null}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              className="h-12 w-20 px-4 hover:bg-gray-50 rounded-full flex flex-col items-center justify-center gap-0.5"
              title="Add text"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16, lineHeight: '16px', fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 16" }}>text_fields</span>
              <span className="text-[11px] font-normal leading-none">Text</span>
            </Button>
          </DropdownMenuTrigger>
          <AnimatedMenuContent align="center" className="w-72 max-h-[70vh] overflow-auto py-1">
            <DropdownMenuItem onClick={() => addTextNow('title')} className="py-2">
              <div className={`text-5xl font-bold leading-tight`}>Title</div>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => addTextNow('headline')} className="py-2">
              <div className={`text-3xl font-semibold leading-tight`}>Headline</div>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => addTextNow('subheadline')} className="py-2">
              <div className={`text-xl font-medium leading-tight`}>Subheadline</div>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => addTextNow('normal')} className="py-2">
              <div className={`text-base leading-tight`}>Normal text</div>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => addTextNow('small')} className="py-2">
              <div className={`text-sm leading-tight`}>Small text</div>
            </DropdownMenuItem>
            <Separator className="my-1" />
            <DropdownMenuItem onClick={() => addTextNow('bullet')} className="py-2">
              <div className={`text-base leading-tight`}>• Bullet list</div>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => addTextNow('number')} className="py-2">
              <div className={`text-base leading-tight`}>1. Numbered list</div>
            </DropdownMenuItem>
          </AnimatedMenuContent>
        </DropdownMenu>

        <Button
          size="sm"
          variant="ghost"
          className="h-12 w-20 px-4 hover:bg-gray-50 rounded-full flex flex-col items-center justify-center gap-0.5"
          onClick={() => console.log('Media picker placeholder')}
          title="Add media"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 16, lineHeight: '16px', fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 16" }}>image</span>
          <span className="text-[11px] font-normal leading-none">Media</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              className="h-12 w-20 px-4 hover:bg-gray-50 rounded-full flex flex-col items-center justify-center gap-0.5"
              title="Add quiz"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16, lineHeight: '16px', fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 16" }}>quiz</span>
              <span className="text-[11px] font-normal leading-none">Quiz</span>
            </Button>
          </DropdownMenuTrigger>
          <AnimatedMenuContent align="center" className="w-72 py-1">
            <DropdownMenuItem onClick={() => console.log('Add Multiple choice')}>
              Multiple choice (single)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => console.log('Add Multiple select')}>
              Multiple select
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => console.log('Add True/False')}>
              True / False
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Text response</DropdownMenuSubTrigger>
              <AnimatedSubContent className="w-56">
                <DropdownMenuItem onClick={() => console.log('Add Short answer')}>Short answer</DropdownMenuItem>
                <DropdownMenuItem onClick={() => console.log('Add Long answer')}>Long answer</DropdownMenuItem>
                <DropdownMenuItem onClick={() => console.log('Add Numeric answer')}>Numeric answer</DropdownMenuItem>
              </AnimatedSubContent>
            </DropdownMenuSub>

            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Structured</DropdownMenuSubTrigger>
              <AnimatedSubContent className="w-56">
                <DropdownMenuItem onClick={() => console.log('Add Fill in the blank')}>Fill in the blank</DropdownMenuItem>
                <DropdownMenuItem onClick={() => console.log('Add Matching')}>Matching</DropdownMenuItem>
                <DropdownMenuItem onClick={() => console.log('Add Ordering')}>Ordering / sequence</DropdownMenuItem>
              </AnimatedSubContent>
            </DropdownMenuSub>

            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Visual / interactive</DropdownMenuSubTrigger>
              <AnimatedSubContent className="w-56">
                <DropdownMenuItem onClick={() => console.log('Add Image choice')}>Image choice</DropdownMenuItem>
                <DropdownMenuItem onClick={() => console.log('Add Hotspot')}>Hotspot / area select</DropdownMenuItem>
                <DropdownMenuItem onClick={() => console.log('Add Rating')}>Rating / Likert</DropdownMenuItem>
              </AnimatedSubContent>
            </DropdownMenuSub>

            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Quick actions</DropdownMenuSubTrigger>
              <AnimatedSubContent className="w-56">
                <DropdownMenuItem onClick={() => console.log('Add from bank')}>Add from question bank</DropdownMenuItem>
                <DropdownMenuItem onClick={() => console.log('Duplicate last')}>Duplicate last question</DropdownMenuItem>
                <DropdownMenuItem onClick={() => console.log('Random N from category')}>Random N from category</DropdownMenuItem>
                <DropdownMenuItem onClick={() => console.log('Import CSV/JSON')}>Import (CSV/JSON)</DropdownMenuItem>
              </AnimatedSubContent>
            </DropdownMenuSub>

            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Settings</DropdownMenuSubTrigger>
              <AnimatedSubContent className="w-56">
                <DropdownMenuItem>Points</DropdownMenuItem>
                <DropdownMenuItem>Required</DropdownMenuItem>
                <DropdownMenuItem>Shuffle answers</DropdownMenuItem>
                <DropdownMenuItem>Attempts</DropdownMenuItem>
                <DropdownMenuItem>Time limit</DropdownMenuItem>
                <DropdownMenuItem>Feedback mode</DropdownMenuItem>
                <DropdownMenuItem>Hints / Explanations</DropdownMenuItem>
                <DropdownMenuItem>Partial credit</DropdownMenuItem>
                <DropdownMenuItem>Show correct</DropdownMenuItem>
                <DropdownMenuItem>Branching</DropdownMenuItem>
              </AnimatedSubContent>
            </DropdownMenuSub>
          </AnimatedMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="ghost" className="h-12 w-20 px-4 hover:bg-gray-50 rounded-full flex flex-col items-center justify-center gap-0.5" title="Add shape">
              <span className="material-symbols-outlined" style={{ fontSize: 16, lineHeight: '16px', fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 16" }}>category</span>
              <span className="text-[11px] font-normal leading-none">Shapes</span>
            </Button>
          </DropdownMenuTrigger>
          <AnimatedMenuContent align="center" className="w-48">
            <DropdownMenuItem onClick={() => addShape('rectangle')} className="flex items-center gap-2">
              <svg width="16" height="12" viewBox="0 0 16 12" className="text-primary"><rect x="1.5" y="1.5" width="13" height="9" fill="none" stroke="currentColor" strokeWidth="1.5" rx="1"/></svg>
              Rectangle
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => addShape('circle')} className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 16 16" className="text-primary"><circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.5"/></svg>
              Circle
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => addShape('triangle')} className="flex items-center gap-2">
              <svg width="16" height="14" viewBox="0 0 16 14" className="text-primary"><polygon points="8,2 2,12 14,12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>
              Triangle
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => addShape('line')} className="flex items-center gap-2">
              <svg width="16" height="2" viewBox="0 0 16 2" className="text-primary"><line x1="1" y1="1" x2="15" y2="1" stroke="currentColor" strokeWidth="1.5"/></svg>
              Line
            </DropdownMenuItem>
          </AnimatedMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="ghost" className="h-12 w-20 px-4 hover:bg-gray-50 rounded-full flex flex-col items-center justify-center gap-0.5" title="Insert variable">
              <span className="material-symbols-outlined" style={{ fontSize: 16, lineHeight: '16px', fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 16" }}>data_object</span>
              <span className="text-[11px] font-normal leading-none">Variables</span>
            </Button>
          </DropdownMenuTrigger>
          <AnimatedMenuContent align="center" className="w-56">
            <DropdownMenuItem onClick={() => window.dispatchEvent(new CustomEvent('cc-insert-variable', { detail: { key: 'company_logo' } }))}>
              Company logo
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => window.dispatchEvent(new CustomEvent('cc-insert-variable', { detail: { key: 'fname' } }))}>
              First name
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => window.dispatchEvent(new CustomEvent('cc-insert-variable', { detail: { key: 'lname' } }))}>
              Last name
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => window.dispatchEvent(new CustomEvent('cc-insert-variable', { detail: { key: 'email' } }))}>
              Email
            </DropdownMenuItem>
          </AnimatedMenuContent>
        </DropdownMenu>
      </div>
    </div>,
    portalTarget
  );
}

// Animated wrappers for dropdown content using GSAP
function AnimatedMenuContent(props: React.ComponentProps<typeof DropdownMenuContent>) {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    gsap.fromTo(
      el,
      { opacity: 0, y: -12, scale: 0.9, transformOrigin: 'top center', force3D: true },
      { opacity: 1, y: 0, scale: 1, duration: 0.28, ease: 'back.out(2.2)' }
    );
    return () => {
      gsap.killTweensOf(el);
    };
  }, []);
  return (
    <DropdownMenuContent
      ref={ref as any}
      {...props}
      className={`${props.className ?? ''} data-[state=open]:animate-none data-[state=closed]:animate-none`}
    />
  );
}

function AnimatedSubContent(props: React.ComponentProps<typeof DropdownMenuSubContent>) {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    gsap.fromTo(
      el,
      { opacity: 0, x: -12, scale: 0.95, transformOrigin: 'left center', force3D: true },
      { opacity: 1, x: 0, scale: 1, duration: 0.24, ease: 'back.out(2)' }
    );
    return () => gsap.killTweensOf(el);
  }, []);
  return (
    <DropdownMenuSubContent
      ref={ref as any}
      {...props}
      className={`${props.className ?? ''} data-[state=open]:animate-none data-[state=closed]:animate-none`}
    />
  );
}


