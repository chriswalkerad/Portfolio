"use client";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";

export type TextVariant = "title" | "headline" | "subheadline" | "normal" | "small" | "bullet" | "number";
export type ShapeVariant = "rectangle" | "circle" | "triangle" | "line";

type ToolBarProps = {
  gridView: boolean;
  addTextNow: (variant: TextVariant) => void;
  addShape: (variant: ShapeVariant) => void;
};

export function ToolBar({ gridView, addTextNow, addShape }: ToolBarProps) {
  if (gridView) return null;
  return (
    <div className="absolute left-1/2 -translate-x-1/2 top-3 z-10" aria-label="Tool bar">
      <div className="flex items-center gap-6 rounded-[28px] bg-white/98 shadow-lg px-4 py-2 border border-black/5">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              className="h-12 px-4 hover:bg-gray-50 rounded-full flex flex-col items-center justify-center gap-0.5"
              title="Add text"
            >
              <span className="material-symbols-outlined text-[18px] leading-none" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>text_fields</span>
              <span className="text-[11px] font-normal leading-none">Text</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="w-72 max-h-[70vh] overflow-auto py-1">
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
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          size="sm"
          variant="ghost"
          className="h-12 px-4 hover:bg-gray-50 rounded-full flex flex-col items-center justify-center gap-0.5"
          onClick={() => console.log('Media picker placeholder')}
          title="Add media"
        >
          <span className="material-symbols-outlined text-[18px] leading-none" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>image</span>
          <span className="text:[11px] font-normal leading-none">Media</span>
        </Button>

        <Button
          size="sm"
          variant="ghost"
          className="h-12 px-4 hover:bg-gray-50 rounded-full flex flex-col items-center justify-center gap-0.5"
          onClick={() => console.log('Quiz placeholder')}
          title="Add quiz"
        >
          <span className="material-symbols-outlined text-[18px] leading-none" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>quiz</span>
          <span className="text-[11px] font-normal leading-none">Quiz</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="ghost" className="h-12 px-4 hover:bg-gray-50 rounded-full flex flex-col items-center justify-center gap-0.5" title="Add shape">
              <span className="material-symbols-outlined text-[18px] leading-none" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>category</span>
              <span className="text-[11px] font-normal leading-none">Shapes</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="w-48">
            <DropdownMenuItem onClick={() => addShape('rectangle')} className="flex items-center gap-2">
              <div className="w-4 h-3 bg-primary rounded-sm"></div>
              Rectangle
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => addShape('circle')} className="flex items-center gap-2">
              <div className="w-4 h-4 bg-primary rounded-full"></div>
              Circle
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => addShape('triangle')} className="flex items-center gap-2">
              <div className="w-0 h-0 border-l-2 border-r-2 border-b-4 border-l-transparent border-r-transparent border-b-primary"></div>
              Triangle
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => addShape('line')} className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-primary"></div>
              Line
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}


