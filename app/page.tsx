"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import gsap from "gsap";
import Draggable from "gsap/Draggable";

type TextVariant = "title" | "headline" | "subheadline" | "normal" | "small" | "bullet" | "number";
type ShapeVariant = "rectangle" | "circle" | "triangle" | "line";
type Block = {
  id: number;
  type: "text" | "shape";
  variant: TextVariant | ShapeVariant;
  text?: string;
  x: number;
  y: number;
  fontSize?: number;
  bold?: boolean;
  color?: string;
  zIndex?: number;
  width?: number;
  height?: number;
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
};

type Slide = {
  id: number;
  title: string;
  blocks: Block[];
};

const variantToClasses: Record<TextVariant, string> = {
  title: "text-5xl font-bold",
  headline: "text-3xl font-semibold",
  subheadline: "text-xl font-medium",
  normal: "text-base",
  small: "text-sm",
  bullet: "text-base whitespace-pre-line",
  number: "text-base whitespace-pre-line",
};

const defaultText = (v: TextVariant) =>
  ({
    title: "Title",
    headline: "Headline",
    subheadline: "Subheadline",
    normal: "Normal text",
    small: "Small text",
    bullet: "• First item\n• Second item",
    number: "1. First item\n2. Second item",
  } as const)[v];

const defaultFontSize = (v: TextVariant) =>
  ({
    title: 48,
    headline: 36,
    subheadline: 24,
    normal: 16,
    small: 14,
    bullet: 16,
    number: 16,
  } as const)[v];

gsap.registerPlugin(Draggable);

export default function ContentCreatorPage() {
  const [title, setTitle] = useState("Title of episode can go here");
  const [editingTitle, setEditingTitle] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [gridView, setGridView] = useState(false);
  
  // Undo/Redo state
  const [history, setHistory] = useState<Array<{slides: Slide[], currentSlideId: number}>>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [slides, setSlides] = useState<Slide[]>([{ id: 1, title: "Slide 1", blocks: [] }]);
  const [currentSlideId, setCurrentSlideId] = useState(1);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectedSlideIds, setSelectedSlideIds] = useState<number[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [resizingId, setResizingId] = useState<number | null>(null);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const [copiedBlocks, setCopiedBlocks] = useState<Block[]>([]);
  const [textPlacementMode, setTextPlacementMode] = useState<TextVariant | null>(null);
  const [shapePlacementMode, setShapePlacementMode] = useState<ShapeVariant | null>(null);
  const [marqueeSelection, setMarqueeSelection] = useState<{
    isActive: boolean;
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
  }>({ isActive: false, startX: 0, startY: 0, currentX: 0, currentY: 0 });
  
  const selectedId = selectedIds.length === 1 ? selectedIds[0] : null;
  const nextId = useRef(1);
  const nextSlideId = useRef(2);
  const canvasRef = useRef<HTMLDivElement>(null);
  const saveTimeout = useRef<number | null>(null);

  const currentSlide = slides.find(s => s.id === currentSlideId);
  const blocks = useMemo(() => currentSlide?.blocks || [], [currentSlide]);

  const addText = (variant: TextVariant, x: number = 40, y: number = 40) => {
    saveToHistory();
    const newBlock: Block = {
      id: nextId.current++,
      type: "text",
      variant,
      text: defaultText(variant),
      x,
      y,
      fontSize: defaultFontSize(variant),
      bold: variant === "title" || variant === "headline",
    };
    setSlides(prev => prev.map(slide => 
      slide.id === currentSlideId 
        ? { ...slide, blocks: [...slide.blocks, newBlock] }
        : slide
    ));
    setSelectedIds([newBlock.id]);
    setSelectedSlideIds([]);
    return newBlock.id;
  };

  const addShape = (variant: ShapeVariant, x: number = 40, y: number = 40) => {
    saveToHistory();
    const newBlock: Block = {
      id: nextId.current++,
      type: "shape",
      variant,
      x,
      y,
      width: variant === "line" ? 100 : 120,
      height: variant === "line" ? 2 : 80,
      fillColor: variant === "line" ? "transparent" : "#3b82f6",
      strokeColor: "#1e40af",
      strokeWidth: variant === "line" ? 2 : 1,
    };
    setSlides(prev => prev.map(slide => 
      slide.id === currentSlideId 
        ? { ...slide, blocks: [...slide.blocks, newBlock] }
        : slide
    ));
    setSelectedIds([newBlock.id]);
    setSelectedSlideIds([]);
    return newBlock.id;
  };

  const addSlide = () => {
    saveToHistory();
    const newSlide: Slide = {
      id: nextSlideId.current++,
      title: `Slide ${slides.length + 1}`,
      blocks: []
    };
    setSlides(prev => [...prev, newSlide]);
    setCurrentSlideId(newSlide.id);
  };

  const deleteSlide = (slideId: number) => {
    if (slides.length <= 1) return; // Don't delete last slide
    setSlides(prev => prev.filter(s => s.id !== slideId));
    if (slideId === currentSlideId) {
      const remainingSlides = slides.filter(s => s.id !== slideId);
      setCurrentSlideId(remainingSlides[0]?.id || 1);
    }
  };

  const deleteSelectedSlides = () => {
    if (selectedSlideIds.length === 0) return;
    
    setSlides(prev => {
      const newSlides = prev.filter(s => !selectedSlideIds.includes(s.id));
      
      // If all slides were deleted, set currentSlideId to null for empty state
      if (newSlides.length === 0) {
        setCurrentSlideId(0); // Use 0 to indicate no slides
        return [];
      }
      
      // If current slide was deleted, switch to first remaining slide
      if (selectedSlideIds.includes(currentSlideId)) {
        setCurrentSlideId(newSlides[0].id);
      }
      
      return newSlides;
    });
    setSelectedSlideIds([]);
  };

  const duplicateSelectedSlides = () => {
    if (selectedSlideIds.length === 0) return;
    
    const slidesToDuplicate = slides.filter(s => selectedSlideIds.includes(s.id));
    const newSlides = slidesToDuplicate.map(slide => ({
      ...slide,
      id: nextSlideId.current++,
      title: `${slide.title} Copy`,
      blocks: slide.blocks.map(block => ({
        ...block,
        id: nextId.current++
      }))
    }));

    setSlides(prev => [...prev, ...newSlides]);
    setSelectedSlideIds([]);
  };

  const deleteBlocks = (blockIds: number[]) => {
    saveToHistory();
    setSlides(prev => prev.map(slide => 
      slide.id === currentSlideId 
        ? { ...slide, blocks: slide.blocks.filter(b => !blockIds.includes(b.id)) }
        : slide
    ));
    setSelectedIds(prev => prev.filter(id => !blockIds.includes(id)));
    if (blockIds.includes(editingId || -1)) setEditingId(null);
  };

  // Undo/Redo functions
  const saveToHistory = useCallback(() => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push({ slides, currentSlideId });
      return newHistory.slice(-50); // Keep only last 50 states
    });
    setHistoryIndex(prev => Math.min(prev + 1, 49));
  }, [slides, currentSlideId, historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const previousState = history[historyIndex - 1];
      setSlides(previousState.slides);
      setCurrentSlideId(previousState.currentSlideId);
      setHistoryIndex(prev => prev - 1);
      setSelectedIds([]);
      setSelectedSlideIds([]);
      setEditingId(null);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setSlides(nextState.slides);
      setCurrentSlideId(nextState.currentSlideId);
      setHistoryIndex(prev => prev + 1);
      setSelectedIds([]);
      setSelectedSlideIds([]);
      setEditingId(null);
    }
  }, [history, historyIndex]);

  const reorderSlides = useCallback((fromIndex: number, toIndex: number) => {
    saveToHistory();
    setSlides(prev => {
      const newSlides = [...prev];
      const [movedSlide] = newSlides.splice(fromIndex, 1);
      newSlides.splice(toIndex, 0, movedSlide);
      return newSlides;
    });
  }, [saveToHistory]);

  const deleteBlock = (blockId: number) => deleteBlocks([blockId]);

  const copySelectedBlocks = () => {
    const selectedBlocks = blocks.filter(b => selectedIds.includes(b.id));
    setCopiedBlocks(selectedBlocks);
  };

  const duplicateSelectedBlocks = () => {
    const selectedBlocks = blocks.filter(b => selectedIds.includes(b.id));
    const newBlocks = selectedBlocks.map(block => ({
      ...block,
      id: nextId.current++,
      x: block.x + 20,
      y: block.y + 20,
    }));
    
    setSlides(prev => prev.map(slide => 
      slide.id === currentSlideId 
        ? { ...slide, blocks: [...slide.blocks, ...newBlocks] }
        : slide
    ));
    setSelectedIds(newBlocks.map(b => b.id));
  };

  const pasteBlocks = () => {
    if (copiedBlocks.length === 0) return;
    const newBlocks = copiedBlocks.map(block => ({
      ...block,
      id: nextId.current++,
      x: block.x + 20, // Offset pasted blocks
      y: block.y + 20,
    }));
    setSlides(prev => prev.map(slide => 
      slide.id === currentSlideId 
        ? { ...slide, blocks: [...slide.blocks, ...newBlocks] }
        : slide
    ));
  };

  const updateBlockInSlide = useCallback((blockId: number, updates: Partial<Block>) => {
    // Only save to history for significant changes (not just position updates during drag)
    if ('text' in updates || 'fontSize' in updates || 'bold' in updates) {
      saveToHistory();
    }
    setSlides(prev => prev.map(slide => 
      slide.id === currentSlideId 
        ? { ...slide, blocks: slide.blocks.map(b => b.id === blockId ? { ...b, ...updates } : b) }
        : slide
    ));
  }, [currentSlideId, saveToHistory]);

  // Layer management functions
  const bringToFront = useCallback((blockId: number) => {
    saveToHistory();
    const maxZ = Math.max(...blocks.map(b => b.zIndex || 0));
    updateBlockInSlide(blockId, { zIndex: maxZ + 1 });
  }, [blocks, saveToHistory, updateBlockInSlide]);

  const sendToBack = useCallback((blockId: number) => {
    saveToHistory();
    const minZ = Math.min(...blocks.map(b => b.zIndex || 0));
    updateBlockInSlide(blockId, { zIndex: minZ - 1 });
  }, [blocks, saveToHistory, updateBlockInSlide]);

  const getBlocksInSelection = useCallback((startX: number, startY: number, endX: number, endY: number) => {
    const minX = Math.min(startX, endX);
    const maxX = Math.max(startX, endX);
    const minY = Math.min(startY, endY);
    const maxY = Math.max(startY, endY);

    return blocks.filter(block => {
      // Get block element to calculate its bounds
      const blockElement = document.getElementById(`block-${block.id}`);
      if (!blockElement) return false;
      
      const blockRect = blockElement.getBoundingClientRect();
      const canvasRect = canvasRef.current?.getBoundingClientRect();
      if (!canvasRect) return false;
      
      // Convert block position to canvas-relative coordinates
      const blockLeft = blockRect.left - canvasRect.left;
      const blockTop = blockRect.top - canvasRect.top;
      const blockRight = blockLeft + blockRect.width;
      const blockBottom = blockTop + blockRect.height;
      
      // Check if selection rectangle intersects with block rectangle
      return !(maxX < blockLeft || minX > blockRight || maxY < blockTop || minY > blockBottom);
    });
  }, [blocks]);

  // Load from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem("cc_state_v2");
      if (!raw) return;
      const parsed = JSON.parse(raw) as { title?: string; slides?: Slide[]; currentSlideId?: number };
      if (parsed.title) setTitle(parsed.title);
      if (Array.isArray(parsed.slides) && parsed.slides.length > 0) {
        setSlides(parsed.slides);
        setCurrentSlideId(parsed.currentSlideId || parsed.slides[0].id);
        
        // Update nextId and nextSlideId
        const maxBlockId = parsed.slides.reduce((max, slide) => 
          Math.max(max, slide.blocks.reduce((m, b) => (b.id > m ? b.id : m), 0)), 0
        );
        const maxSlideId = parsed.slides.reduce((m, s) => (s.id > m ? s.id : m), 0);
        nextId.current = maxBlockId + 1;
        nextSlideId.current = maxSlideId + 1;
      }
    } catch {
      // ignore
    }
  }, []);

  // Debounced save to localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (saveTimeout.current) window.clearTimeout(saveTimeout.current);
    
    setSaveStatus('saving');
    saveTimeout.current = window.setTimeout(() => {
      try {
        const payload = JSON.stringify({ title, slides, currentSlideId });
        localStorage.setItem("cc_state_v2", payload);
        setSaveStatus('saved');
      } catch (error) {
        setSaveStatus('error');
        console.error('Failed to save:', error);
      }
    }, 300);
    
    return () => {
      if (saveTimeout.current) window.clearTimeout(saveTimeout.current);
    };
  }, [title, slides, currentSlideId]);

  // Global mouse event handlers for marquee selection
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (marqueeSelection.isActive && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setMarqueeSelection(prev => ({ ...prev, currentX: x, currentY: y }));
      }
    };

    const handleGlobalMouseUp = () => {
      if (marqueeSelection.isActive && canvasRef.current) {
        const selectedBlocks = getBlocksInSelection(
          marqueeSelection.startX,
          marqueeSelection.startY,
          marqueeSelection.currentX,
          marqueeSelection.currentY
        );
        
        setSelectedIds(selectedBlocks.map(b => b.id));
        setSelectedSlideIds([]);
        setMarqueeSelection(prev => ({ ...prev, isActive: false }));
      }
    };

    if (marqueeSelection.isActive) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [marqueeSelection.isActive, marqueeSelection.startX, marqueeSelection.startY, marqueeSelection.currentX, marqueeSelection.currentY, getBlocksInSelection]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (editingId !== null) {
        if (e.key === "Escape") setEditingId(null);
        return;
      }

      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
        return;
      }

      const isCmd = e.ctrlKey || e.metaKey;
      const isShift = e.shiftKey;

      if (e.key.toLowerCase() === 't' && !isCmd) {
        e.preventDefault();
        if (selectedIds.length === 1) {
          const selectedId = selectedIds[0];
          setEditingId(selectedId);
          setTimeout(() => {
            const el = document.getElementById(`text-${selectedId}`);
            if (el) {
              el.focus();
              const range = document.createRange();
              range.selectNodeContents(el);
              const selection = window.getSelection();
              selection?.removeAllRanges();
              selection?.addRange(range);
            }
          }, 0);
        } else {
          setTextPlacementMode('normal');
        }
        return;
      }

      // Slide-related shortcuts (when slides are selected)
      if (selectedSlideIds.length > 0) {
        switch (e.key.toLowerCase()) {
          case 'delete':
          case 'backspace':
            e.preventDefault();
            deleteSelectedSlides();
            break;

          case 'd':
            if (isCmd) {
              e.preventDefault();
              duplicateSelectedSlides();
            }
            break;
        }
        return; // Don't process other shortcuts when slides are selected
      }

      // Block-related shortcuts (require selection)
      if (selectedIds.length > 0) {
        switch (e.key.toLowerCase()) {

          case 'delete':
          case 'backspace':
            e.preventDefault();
            selectedIds.forEach(id => deleteBlock(id));
            break;

          case 'b':
            if (isCmd) {
              e.preventDefault();
              selectedIds.forEach(id => {
                const currentBlock = blocks.find(b => b.id === id);
                updateBlockInSlide(id, { bold: !currentBlock?.bold });
              });
            }
            break;

          case 'c':
            if (isCmd) {
              e.preventDefault();
              copySelectedBlocks();
            }
            break;

          case 'd':
            if (isCmd) {
              e.preventDefault();
              duplicateSelectedBlocks();
            }
            break;

          case '=':
          case '+':
            e.preventDefault();
            selectedIds.forEach(id => {
              const currentBlock = blocks.find(b => b.id === id);
              if (currentBlock?.type === "text") {
                const currentSize = currentBlock?.fontSize ?? defaultFontSize(currentBlock?.variant as TextVariant || 'normal');
                updateBlockInSlide(id, { fontSize: Math.min(96, currentSize + 2) });
              }
            });
            break;

          case '-':
            e.preventDefault();
            selectedIds.forEach(id => {
              const currentBlock = blocks.find(b => b.id === id);
              if (currentBlock?.type === "text") {
                const currentSize = currentBlock?.fontSize ?? defaultFontSize(currentBlock?.variant as TextVariant || 'normal');
                updateBlockInSlide(id, { fontSize: Math.max(10, currentSize - 2) });
              }
            });
            break;

          case ']':
            if (isCmd) {
              e.preventDefault();
              selectedIds.forEach(id => bringToFront(id));
            }
            break;

          case '[':
            if (isCmd) {
              e.preventDefault();
              selectedIds.forEach(id => sendToBack(id));
            }
            break;
        }
      }

      // Global shortcuts
      switch (e.key.toLowerCase()) {
        case 'z':
          if (isCmd && isShift) {
            e.preventDefault();
            redo();
          } else if (isCmd) {
            e.preventDefault();
            undo();
          }
          break;

        case 'v':
          if (isCmd) {
            e.preventDefault();
            pasteBlocks();
          }
          break;

        case 'n':
          if (isCmd && isShift) {
            e.preventDefault();
            addSlide();
          }
          break;

                  case 'escape':
          e.preventDefault();
          setSelectedIds([]);
          setSelectedSlideIds([]);
          setEditingId(null);
          setTextPlacementMode(null);
          setShapePlacementMode(null);
          setResizingId(null);
          break;

        case 'arrowleft':
          if (isCmd) {
            e.preventDefault();
            const currentIndex = slides.findIndex(s => s.id === currentSlideId);
            if (currentIndex > 0) {
              setCurrentSlideId(slides[currentIndex - 1].id);
              setSelectedIds([]);
              setSelectedSlideIds([]);
            }
          }
          break;

        case 'arrowright':
          if (isCmd) {
            e.preventDefault();
            const currentIndex = slides.findIndex(s => s.id === currentSlideId);
            if (currentIndex < slides.length - 1) {
              setCurrentSlideId(slides[currentIndex + 1].id);
              setSelectedIds([]);
              setSelectedSlideIds([]);
            }
          }
          break;

        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
          if (isCmd) {
            e.preventDefault();
            const variants: TextVariant[] = ['title', 'headline', 'subheadline', 'normal', 'small', 'bullet', 'number'];
            const variantIndex = parseInt(e.key) - 1;
            if (variantIndex >= 0 && variantIndex < variants.length) {
              setTextPlacementMode(variants[variantIndex]);
            }
          }
          break;

        case 'a':
          if (isCmd) {
            e.preventDefault();
            if (selectedSlideIds.length > 0) {
              // If slides are selected, select all slides
              setSelectedSlideIds(slides.map(s => s.id));
            } else {
              // Select all blocks on current slide
              setSelectedIds(blocks.map(b => b.id));
              setSelectedSlideIds([]);
            }
          }
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedId, editingId, blocks, slides, currentSlideId, selectedIds, selectedSlideIds, copySelectedBlocks, pasteBlocks, deleteBlock, deleteSelectedSlides, duplicateSelectedSlides, addSlide, addText, updateBlockInSlide, bringToFront, sendToBack, undo, redo, duplicateSelectedBlocks]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    blocks.forEach((b) => {
      const el = document.getElementById(`block-${b.id}`);
      if (!el) return;
      
      // Kill existing draggable instance
      Draggable.get(el)?.kill();
      
      // Create new draggable instance
      Draggable.create(el, {
        type: "x,y",
        bounds: canvas,
        inertia: false,
        minimumMovement: 3, // Lower threshold for smoother click-to-drag
        dragClickables: false,
        onPress(e) {
          // This fires immediately on mouse down - handle selection here
          // Only handle normal clicks (modifier keys are handled by React onMouseDown)
          const event = e.originalEvent || e;
          if (!event.metaKey && !event.ctrlKey && !event.shiftKey) {
            setSelectedIds([b.id]);
            setSelectedSlideIds([]);
            setEditingId(null);
            setTextPlacementMode(null);
            setShapePlacementMode(null);
          }
        },
        onDragStart() {
          // Ensure block is selected when drag actually starts
          if (!selectedIds.includes(b.id)) {
            setSelectedIds([b.id]);
            setSelectedSlideIds([]);
            setEditingId(null);
            setTextPlacementMode(null);
            setShapePlacementMode(null);
          }
        },
        onDrag() {
          // If multiple blocks are selected, move them together
          if (selectedIds.length > 1 && selectedIds.includes(b.id)) {
            const { x, y } = this as unknown as { x: number; y: number };
            const draggedBlock = blocks.find(block => block.id === b.id);
            if (!draggedBlock) return;
            
            const deltaX = x - draggedBlock.x;
            const deltaY = y - draggedBlock.y;
            
            selectedIds.forEach(blockId => {
              if (blockId !== b.id) {
                const otherEl = document.getElementById(`block-${blockId}`);
                const otherBlock = blocks.find(block => block.id === blockId);
                if (otherEl && otherBlock) {
                  gsap.set(otherEl, { 
                    x: otherBlock.x + deltaX, 
                    y: otherBlock.y + deltaY 
                  });
                }
              }
            });
          }
        },
        onDragEnd() {
          const { x, y } = this as unknown as { x: number; y: number };
          saveToHistory(); // Save state before drag changes
          
          if (selectedIds.length > 1 && selectedIds.includes(b.id)) {
            // Update all selected blocks
            const draggedBlock = blocks.find(block => block.id === b.id);
            if (!draggedBlock) return;
            
            const deltaX = x - draggedBlock.x;
            const deltaY = y - draggedBlock.y;
            
            selectedIds.forEach(blockId => {
              const block = blocks.find(b => b.id === blockId);
              if (block) {
                updateBlockInSlide(blockId, { 
                  x: block.x + deltaX, 
                  y: block.y + deltaY 
                });
              }
            });
          } else {
            // Single block update
            updateBlockInSlide(b.id, { x, y });
          }
        },
      });
      
      // Set initial position
      gsap.set(el, { x: b.x, y: b.y });
    });
    
    return () => {
      blocks.forEach((b) => Draggable.get(`#block-${b.id}`)?.kill());
    };
  }, [blocks, selectedIds, saveToHistory, updateBlockInSlide]);

  // GSAP Draggable for slide reordering
  useEffect(() => {
    if (sidebarCollapsed || slides.length <= 1) return;

    const slideElements = slides.map(slide => document.getElementById(`slide-${slide.id}`)).filter(Boolean);
    
    slideElements.forEach((el) => {
      if (!el) return;
      
      Draggable.get(el)?.kill();
      
      Draggable.create(el, {
        type: "y",
        bounds: el.parentElement,
        inertia: false,
        minimumMovement: 5,
        onDragStart() {
          el.style.zIndex = "1000";
          el.style.transform += " scale(1.02)";
        },
        onDrag() {
          // Calculate drop position based on mouse position
          const rect = el.getBoundingClientRect();
          const centerY = rect.top + rect.height / 2;
          const siblings = Array.from(el.parentElement?.children || []).filter(child => 
            child !== el && child.id?.startsWith('slide-')
          );
          
          siblings.forEach(sibling => {
            const siblingEl = sibling as HTMLElement;
            const siblingRect = siblingEl.getBoundingClientRect();
            const siblingCenter = siblingRect.top + siblingRect.height / 2;
            
            if (centerY > siblingCenter) {
              siblingEl.style.transform = "translateY(-8px)";
            } else {
              siblingEl.style.transform = "translateY(8px)";
            }
          });
        },
        onDragEnd() {
          el.style.zIndex = "";
          el.style.transform = el.style.transform.replace(" scale(1.02)", "");
          
          // Reset all sibling transforms
          const siblings = Array.from(el.parentElement?.children || []).filter(child => 
            child !== el && child.id?.startsWith('slide-')
          );
          siblings.forEach(sibling => {
            (sibling as HTMLElement).style.transform = "";
          });
          
          // Calculate new position
          const rect = el.getBoundingClientRect();
          const centerY = rect.top + rect.height / 2;
          const slideId = parseInt(el.id.replace('slide-', ''));
          const currentIndex = slides.findIndex(s => s.id === slideId);
          
          let newIndex = currentIndex;
          siblings.forEach((sibling) => {
            const siblingRect = sibling.getBoundingClientRect();
            const siblingCenter = siblingRect.top + siblingRect.height / 2;
            const siblingId = parseInt(sibling.id.replace('slide-', ''));
            const siblingIndex = slides.findIndex(s => s.id === siblingId);
            
            if (centerY > siblingCenter && siblingIndex > currentIndex) {
              newIndex = Math.max(newIndex, siblingIndex);
            } else if (centerY < siblingCenter && siblingIndex < currentIndex) {
              newIndex = Math.min(newIndex, siblingIndex);
            }
          });
          
          if (newIndex !== currentIndex) {
            reorderSlides(currentIndex, newIndex);
          }
          
          // Reset position
          gsap.set(el, { y: 0 });
        },
      });
    });
    
    return () => {
      slideElements.forEach(el => {
        if (el) Draggable.get(el)?.kill();
      });
    };
  }, [slides, sidebarCollapsed, reorderSlides]);

  // GSAP Draggable for resize handles
  useEffect(() => {
    if (!resizingId) return;

    const blockElement = document.getElementById(`block-${resizingId}`);
    const block = blocks.find(b => b.id === resizingId);
    if (!blockElement || !block) return;
    
    const contentElement = block.type === "text" 
      ? document.getElementById(`text-${resizingId}`)
      : document.getElementById(`shape-${resizingId}`);
    if (!contentElement) return;

    // Get all resize handles for this block
    const handles = ['nw', 'ne', 'sw', 'se', 'n', 's', 'w', 'e'];
    
    handles.forEach(direction => {
      const handle = blockElement.querySelector(`[data-resize-handle="${direction}"]`) as HTMLElement;
      if (!handle) return;

      Draggable.get(handle)?.kill();
      
      let initialWidth: number;
      let initialHeight: number;
      let initialX: number;
      let initialY: number;
      
      Draggable.create(handle, {
        type: "x,y",
        onPress() {
          // Store initial dimensions and position when drag starts
          initialWidth = block.width || contentElement.offsetWidth || 200;
          initialHeight = block.height || contentElement.offsetHeight || 50;
          initialX = block.x;
          initialY = block.y;
        },
        onDrag() {
          const { x: dragX, y: dragY } = this as unknown as { x: number; y: number };
          
          let newWidth = initialWidth;
          let newHeight = initialHeight;
          let newX = initialX;
          let newY = initialY;

          // Calculate new dimensions based on handle direction and drag distance
          switch (direction) {
            case 'e': // East - right edge
              newWidth = Math.max(80, initialWidth + dragX);
              break;
            case 'w': // West - left edge  
              newWidth = Math.max(80, initialWidth - dragX);
              newX = initialX + (initialWidth - newWidth);
              break;
            case 's': // South - bottom edge
              newHeight = Math.max(30, initialHeight + dragY);
              break;
            case 'n': // North - top edge
              newHeight = Math.max(30, initialHeight - dragY);
              newY = initialY + (initialHeight - newHeight);
              break;
            case 'se': // Southeast - bottom right
              newWidth = Math.max(80, initialWidth + dragX);
              newHeight = Math.max(30, initialHeight + dragY);
              break;
            case 'sw': // Southwest - bottom left
              newWidth = Math.max(80, initialWidth - dragX);
              newHeight = Math.max(30, initialHeight + dragY);
              newX = initialX + (initialWidth - newWidth);
              break;
            case 'ne': // Northeast - top right
              newWidth = Math.max(80, initialWidth + dragX);
              newHeight = Math.max(30, initialHeight - dragY);
              newY = initialY + (initialHeight - newHeight);
              break;
            case 'nw': // Northwest - top left
              newWidth = Math.max(80, initialWidth - dragX);
              newHeight = Math.max(30, initialHeight - dragY);
              newX = initialX + (initialWidth - newWidth);
              newY = initialY + (initialHeight - newHeight);
              break;
          }

          // Apply the new dimensions to the content element
          gsap.set(contentElement, { 
            width: newWidth,
            height: newHeight,
            minWidth: newWidth,
            minHeight: newHeight
          });
          
          // Update block position if needed
          if (newX !== initialX || newY !== initialY) {
            gsap.set(blockElement, { x: newX, y: newY });
          }
        },
        onDragEnd() {
          const contentRect = contentElement.getBoundingClientRect();
          
          // Get current GSAP transform values
          const blockX = gsap.getProperty(blockElement, "x") as number;
          const blockY = gsap.getProperty(blockElement, "y") as number;
          
          saveToHistory();
          updateBlockInSlide(resizingId, {
            width: contentRect.width,
            height: contentRect.height,
            x: blockX,
            y: blockY
          });
          
          // Reset handle position
          gsap.set(this.target, { x: 0, y: 0 });
        }
      });
    });

    return () => {
      handles.forEach(direction => {
        const handle = blockElement?.querySelector(`[data-resize-handle="${direction}"]`) as HTMLElement;
        if (handle) Draggable.get(handle)?.kill();
      });
    };
  }, [resizingId, blocks, saveToHistory, updateBlockInSlide]);

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b">
        <div className="mx-auto flex max-w-7xl items-center gap-2 lg:gap-3 px-3 lg:px-4 py-2">
          {editingTitle ? (
            <Input 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="Title of episode" 
              className="max-w-sm lg:max-w-xl text-lg lg:text-2xl font-semibold"
              autoFocus
              onBlur={() => setEditingTitle(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setEditingTitle(false);
                }
                if (e.key === 'Escape') {
                  setEditingTitle(false);
                }
              }}
            />
          ) : (
            <h1 
              className="text-lg lg:text-2xl font-semibold cursor-pointer hover:text-muted-foreground transition-colors max-w-sm lg:max-w-xl"
              onClick={() => setEditingTitle(true)}
              title="Click to edit title"
            >
              {title || "Click to set title"}
            </h1>
          )}
          <div className="ml-auto flex items-center gap-2">
            {/* Save Status Indicator */}
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              {saveStatus === 'saving' && (
                <>
                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                  <span>Saving...</span>
                </>
              )}
              {saveStatus === 'saved' && (
                <>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Saved</span>
                </>
              )}
              {saveStatus === 'error' && (
                <>
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span>Error saving</span>
                </>
              )}
            </div>
            {!gridView && (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">Text</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={() => addText("title")} className="text-4xl font-bold py-3">Title</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => addText("headline")} className="text-2xl font-semibold py-2">Headline</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => addText("subheadline")} className="text-lg font-medium py-1">Subheadline</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => addText("normal")} className="text-base">Normal text</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => addText("small")} className="text-sm">Small text</DropdownMenuItem>
                    <Separator className="my-1" />
                    <DropdownMenuItem onClick={() => addText("bullet")} className="text-base font-normal">• Bullet list</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => addText("number")} className="text-base font-normal">1. Number list</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">Shapes</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={() => addShape("rectangle")} className="flex items-center gap-2">
                      <div className="w-4 h-3 bg-primary rounded-sm"></div>
                      Rectangle
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => addShape("circle")} className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-primary rounded-full"></div>
                      Circle
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => addShape("triangle")} className="flex items-center gap-2">
                      <div className="w-0 h-0 border-l-2 border-r-2 border-b-4 border-l-transparent border-r-transparent border-b-primary"></div>
                      Triangle
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => addShape("line")} className="flex items-center gap-2">
                      <div className="w-4 h-0.5 bg-primary"></div>
                      Line
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}

            <Button variant="ghost">Play</Button>
            <Button variant="ghost">Share</Button>
            <Button>Publish</Button>
          </div>
        </div>
      </header>

      {gridView ? (
        <div className="flex-1 p-6 overflow-auto bg-muted/20">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 max-w-7xl mx-auto">
            {slides.map((slide) => (
              <div
                key={slide.id}
                className={`group relative aspect-video rounded-lg border bg-white cursor-pointer transition-all hover:shadow-lg ${
                  slide.id === currentSlideId 
                    ? 'ring-2 ring-primary' 
                    : selectedSlideIds.includes(slide.id)
                      ? 'ring-2 ring-blue-400'
                      : 'hover:bg-accent'
                }`}
                onClick={(e) => {
                  if (e.metaKey || e.ctrlKey) {
                    setSelectedSlideIds(prev => 
                      prev.includes(slide.id) 
                        ? prev.filter(id => id !== slide.id)
                        : [...prev, slide.id]
                    );
                  } else if (e.shiftKey) {
                    setSelectedSlideIds(prev => 
                      prev.includes(slide.id) ? prev : [...prev, slide.id]
                    );
                  } else {
                    setCurrentSlideId(slide.id);
                    setSelectedSlideIds([]);
                    setSelectedIds([]);
                    setGridView(false); // Exit grid view when selecting a slide
                  }
                }}
              >
                <div className="absolute inset-0 p-2 overflow-hidden">
                  <div className="h-full w-full bg-white rounded border-2 border-gray-100 relative">
                    {/* Mini preview of blocks */}
                    {slide.blocks.map((block) => (
                      <div
                        key={block.id}
                        className="absolute text-[8px] opacity-70 pointer-events-none"
                        style={{
                          left: `${(block.x / 960) * 100}%`,
                          top: `${(block.y / 540) * 100}%`,
                          fontSize: Math.max(6, (block.fontSize || 16) / 8),
                        }}
                      >
                        {block.type === "text" ? block.text?.substring(0, 20) : block.variant}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/50 to-transparent rounded-b-lg">
                  <p className="text-xs font-medium text-white truncate">{slide.title}</p>
                </div>
                {slides.length > 1 && (
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSlide(slide.id);
                    }}
                  >
                    ×
                  </Button>
                )}
              </div>
            ))}
            {/* Add new slide card */}
            <div
              className="aspect-video rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/10 cursor-pointer transition-all hover:bg-muted/20 flex items-center justify-center"
              onClick={addSlide}
            >
              <div className="text-center">
                <div className="text-2xl text-muted-foreground mb-1">+</div>
                <p className="text-xs text-muted-foreground">Add Slide</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className={`grid flex-1 overflow-hidden ${
          sidebarCollapsed 
            ? 'grid-cols-[40px_1fr_200px] lg:grid-cols-[40px_1fr_280px] xl:grid-cols-[40px_1fr_320px]' 
            : 'grid-cols-[200px_1fr_200px] lg:grid-cols-[260px_1fr_280px] xl:grid-cols-[300px_1fr_320px]'
        }`}>
        <aside className="border-r p-3 space-y-2">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && <p className="text-xs text-muted-foreground">Slides</p>}
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="h-6 w-6 p-0"
            >
              {sidebarCollapsed ? '→' : '←'}
            </Button>
            {!sidebarCollapsed && (
              <Button size="sm" variant="ghost" onClick={addSlide}>+</Button>
            )}
          </div>
          {!sidebarCollapsed && <div className="space-y-2">
            {slides.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-center border-2 border-dashed border-muted-foreground/25 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">No slides</p>
                <Button size="sm" onClick={addSlide} variant="outline">
                  Create First Slide
                </Button>
              </div>
            ) : (
              slides.map((slide) => (
              <div
                key={slide.id}
                id={`slide-${slide.id}`}
                className={`group relative h-24 w-full rounded-lg border bg-card cursor-pointer transition-all ${
                  slide.id === currentSlideId 
                    ? 'ring-2 ring-primary' 
                    : selectedSlideIds.includes(slide.id)
                      ? 'ring-2 ring-blue-400'
                      : 'hover:bg-accent'
                }`}
                onClick={(e) => {
                  if (e.metaKey || e.ctrlKey) {
                    // Cmd/Ctrl+click toggles slide selection
                    setSelectedSlideIds(prev => 
                      prev.includes(slide.id) 
                        ? prev.filter(id => id !== slide.id)
                        : [...prev, slide.id]
                    );
                  } else if (e.shiftKey) {
                    // Shift+click adds to slide selection
                    setSelectedSlideIds(prev => 
                      prev.includes(slide.id) ? prev : [...prev, slide.id]
                    );
                  } else {
                    // Regular click behavior:
                    if (slide.id === currentSlideId) {
                      // If clicking the current slide, select it for operations (delete, etc.)
                      setSelectedSlideIds([slide.id]);
                      setSelectedIds([]);
                    } else {
                      // If clicking a different slide, navigate to it and clear selections
                      setCurrentSlideId(slide.id);
                      setSelectedSlideIds([]);
                      setSelectedIds([]);
                    }
                  }
                }}
              >
                <div className="p-2">
                  <p className="text-xs font-medium truncate">{slide.title}</p>
                </div>
                {slides.length > 1 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSlide(slide.id);
                    }}
                  >
                    ×
                  </Button>
                )}
              </div>
              ))
            )}
          </div>}
        </aside>

        <main className="relative overflow-auto">
          <div className="border-b p-2" />
          <div 
            className="flex h-[calc(100%-2.5rem)] items-center justify-center p-6" 
            onClick={() => { setSelectedIds([]); setSelectedSlideIds([]); setEditingId(null); setTextPlacementMode(null); setShapePlacementMode(null); }}
            tabIndex={-1}
          >
            {slides.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[540px] w-[960px] max-h-[50vh] max-w-[80vw] rounded border border-dashed border-muted-foreground/25 bg-muted/10" style={{aspectRatio: '16/9'}}>
                <p className="text-lg text-muted-foreground mb-4">No slides to edit</p>
                <Button onClick={addSlide} variant="outline">
                  Create Your First Slide
                </Button>
              </div>
            ) : (
              <div 
                ref={canvasRef} 
                id="canvas" 
                className={`relative h-[540px] w-[960px] max-h-[50vh] max-w-[80vw] rounded border bg-white outline-none ${
                  textPlacementMode || shapePlacementMode ? 'cursor-crosshair' : 'cursor-default'
                }`} 
                tabIndex={0}
                style={{aspectRatio: '16/9'}}
              onMouseDown={(e) => {
                // Ensure canvas is focused for keyboard shortcuts
                e.currentTarget.focus();
                
                if (textPlacementMode) {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;
                  const newBlockId = addText(textPlacementMode, x, y);
                  setTextPlacementMode(null);
            setShapePlacementMode(null);
                  setTimeout(() => setEditingId(newBlockId), 50);
                  return;
                }

                if (shapePlacementMode) {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;
                  const newBlockId = addShape(shapePlacementMode, x, y);
                  setShapePlacementMode(null);
                  return;
                }

                // Only start marquee selection if clicking directly on canvas (not on a block)
                if (e.target === e.currentTarget) {
                  e.preventDefault();
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;
                  
                  setMarqueeSelection({
                    isActive: true,
                    startX: x,
                    startY: y,
                    currentX: x,
                    currentY: y,
                  });
                  setResizingId(null);
                  // Clear existing selections when starting marquee
                  setSelectedIds([]);
                  setSelectedSlideIds([]);
                }
              }}

            >
              {/* Marquee selection rectangle */}
              {marqueeSelection.isActive && (
                <div
                  className="absolute border border-blue-500 bg-blue-100/20 pointer-events-none"
                  style={{
                    left: Math.min(marqueeSelection.startX, marqueeSelection.currentX),
                    top: Math.min(marqueeSelection.startY, marqueeSelection.currentY),
                    width: Math.abs(marqueeSelection.currentX - marqueeSelection.startX),
                    height: Math.abs(marqueeSelection.currentY - marqueeSelection.startY),
                  }}
                />
              )}


              {blocks.map((b) => (
                <div
                  id={`block-${b.id}`}
                  key={b.id}
                  className={`absolute cursor-move rounded ${b.type === 'shape' ? 'bg-transparent' : 'bg-white/90'} shadow-xs ${selectedIds.includes(b.id) ? "ring-2 ring-primary" : "ring-1 ring-transparent"}`}
                  style={{ left: 0, top: 0, zIndex: b.zIndex || 0 }}
                  onMouseDown={(e) => {
                    if (textPlacementMode || shapePlacementMode) return;
                    
                    // Ensure canvas stays focused for keyboard shortcuts
                    const canvas = canvasRef.current;
                    if (canvas) canvas.focus();
                    
                    // Only handle special modifier clicks here - let GSAP handle normal clicks
                    if (e.metaKey || e.ctrlKey) {
                      e.stopPropagation(); // Prevent GSAP from handling this
                      // Cmd/Ctrl+click for toggle selection
                      setSelectedIds(prev => 
                        prev.includes(b.id) 
                          ? prev.filter(id => id !== b.id)
                          : [...prev, b.id]
                      );
                    } else if (e.shiftKey) {
                      e.stopPropagation(); // Prevent GSAP from handling this
                      // Shift+click for additive selection
                      setSelectedIds(prev => 
                        prev.includes(b.id) ? prev : [...prev, b.id]
                      );
                    }
                    // For normal clicks, let GSAP handle it (don't stopPropagation)
                  }}
                >
                  {/* Text formatting toolbar - only show for text blocks */}
                  {editingId === b.id && b.type === "text" && (
                    <div className="absolute -top-12 left-0 bg-white border rounded-lg shadow-lg px-2 py-1 flex items-center gap-1 z-50">
                      <Button
                        size="sm"
                        variant={b.bold ? "default" : "ghost"}
                        className="h-7 w-7 p-0"
                        onClick={() => updateBlockInSlide(b.id, { bold: !b.bold })}
                      >
                        <strong>B</strong>
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0"
                        onClick={() => updateBlockInSlide(b.id, { fontSize: Math.min(96, (b.fontSize || 16) + 2) })}
                      >
                        A+
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0"
                        onClick={() => updateBlockInSlide(b.id, { fontSize: Math.max(10, (b.fontSize || 16) - 2) })}
                      >
                        A-
                      </Button>
                      <input
                        type="color"
                        className="w-7 h-7 border rounded cursor-pointer"
                        defaultValue="#000000"
                        onChange={(e) => updateBlockInSlide(b.id, { color: e.target.value })}
                      />
                    </div>
                  )}
                  
                  {/* Render text blocks */}
                  {b.type === "text" && (
                    <div
                      id={`text-${b.id}`}
                      className={`min-w-[80px] whitespace-pre-wrap px-3 py-2 ${variantToClasses[b.variant as TextVariant]}`}
                      contentEditable={editingId === b.id}
                      suppressContentEditableWarning
                      style={{ 
                        fontSize: b.fontSize, 
                        fontWeight: b.bold ? 700 : undefined, 
                        cursor: editingId === b.id ? "text" : "move",
                        userSelect: editingId === b.id ? "text" : "none",
                        color: b.color || "#000000",
                        width: b.width || 'auto',
                        height: b.height || 'auto',
                        minWidth: b.width ? `${b.width}px` : '80px',
                        minHeight: b.height ? `${b.height}px` : 'auto'
                      }}
                      onBlur={(e) => {
                        const text = (e.currentTarget as HTMLElement).textContent || "";
                        updateBlockInSlide(b.id, { text });
                        setEditingId(null);
                      }}
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        setEditingId(b.id);
                        setTimeout(() => {
                          const el = document.getElementById(`text-${b.id}`);
                          if (el) {
                            el.focus();
                            const range = document.createRange();
                            range.selectNodeContents(el);
                            const selection = window.getSelection();
                            selection?.removeAllRanges();
                            selection?.addRange(range);
                          }
                        }, 0);
                      }}
                      onKeyDown={(e) => {
                        if (editingId !== b.id) return;
                        if (e.key === "Escape") {
                          e.preventDefault();
                          setEditingId(null);
                          return;
                        }
                        if (e.key !== "Enter") return;
                        if (b.variant === "bullet") {
                          e.preventDefault();
                          document.execCommand("insertText", false, "\n• ");
                        } else if (b.variant === "number") {
                          e.preventDefault();
                          const txt = (e.currentTarget as HTMLElement).textContent || "";
                          const nums = txt
                            .split("\n")
                            .map((line) => parseInt((line.match(/^(\d+)\./)?.[1] as string) || "0", 10))
                            .filter((n) => n > 0);
                          const next = nums.length ? Math.max(...nums) + 1 : (txt.split("\n").length || 0) + 1;
                          document.execCommand("insertText", false, `\n${next}. `);
                        }
                      }}
                    >
                      {b.text}
                    </div>
                  )}

                  {/* Render shape blocks */}
                  {b.type === "shape" && (
                    <div
                      id={`shape-${b.id}`}
                      className="pointer-events-none"
                      style={{
                        width: b.width || 120,
                        height: b.height || 80,
                      }}
                    >
                      <svg
                        width="100%"
                        height="100%"
                        viewBox={`0 0 ${b.width || 120} ${b.height || 80}`}
                        className="pointer-events-none"
                      >
                        {b.variant === "rectangle" && (
                          <rect
                            x={b.strokeWidth || 1}
                            y={b.strokeWidth || 1}
                            width={(b.width || 120) - 2 * (b.strokeWidth || 1)}
                            height={(b.height || 80) - 2 * (b.strokeWidth || 1)}
                            fill={b.fillColor || "#3b82f6"}
                            stroke={b.strokeColor || "#1e40af"}
                            strokeWidth={b.strokeWidth || 1}
                          />
                        )}
                        {b.variant === "circle" && (
                          <ellipse
                            cx={(b.width || 120) / 2}
                            cy={(b.height || 80) / 2}
                            rx={(b.width || 120) / 2 - (b.strokeWidth || 1)}
                            ry={(b.height || 80) / 2 - (b.strokeWidth || 1)}
                            fill={b.fillColor || "#3b82f6"}
                            stroke={b.strokeColor || "#1e40af"}
                            strokeWidth={b.strokeWidth || 1}
                          />
                        )}
                        {b.variant === "triangle" && (
                          <polygon
                            points={`${(b.width || 120) / 2},${b.strokeWidth || 1} ${(b.strokeWidth || 1)},${(b.height || 80) - (b.strokeWidth || 1)} ${(b.width || 120) - (b.strokeWidth || 1)},${(b.height || 80) - (b.strokeWidth || 1)}`}
                            fill={b.fillColor || "#3b82f6"}
                            stroke={b.strokeColor || "#1e40af"}
                            strokeWidth={b.strokeWidth || 1}
                          />
                        )}
                        {b.variant === "line" && (
                          <line
                            x1={0}
                            y1={(b.height || 2) / 2}
                            x2={b.width || 100}
                            y2={(b.height || 2) / 2}
                            stroke={b.strokeColor || "#1e40af"}
                            strokeWidth={b.strokeWidth || 2}
                          />
                        )}
                      </svg>
                    </div>
                  )}
                  
                  {/* Resize handles - only show for selected blocks */}
                  {selectedIds.includes(b.id) && selectedIds.length === 1 && (
                    <>
                      {/* Corner handles - diagonal cursors */}
                      <div className="absolute -top-1 -left-1 w-3 h-3 bg-primary border border-white rounded-full cursor-nw-resize" 
                           data-resize-handle="nw"
                           onMouseDown={(e) => { e.stopPropagation(); setResizingId(b.id); }} />
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary border border-white rounded-full cursor-ne-resize" 
                           data-resize-handle="ne"
                           onMouseDown={(e) => { e.stopPropagation(); setResizingId(b.id); }} />
                      <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-primary border border-white rounded-full cursor-sw-resize" 
                           data-resize-handle="sw"
                           onMouseDown={(e) => { e.stopPropagation(); setResizingId(b.id); }} />
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary border border-white rounded-full cursor-se-resize" 
                           data-resize-handle="se"
                           onMouseDown={(e) => { e.stopPropagation(); setResizingId(b.id); }} />
                      
                      {/* Edge handles - horizontal/vertical cursors */}
                      <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-primary border border-white rounded-full cursor-n-resize" 
                           data-resize-handle="n"
                           onMouseDown={(e) => { e.stopPropagation(); setResizingId(b.id); }} />
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-primary border border-white rounded-full cursor-s-resize" 
                           data-resize-handle="s"
                           onMouseDown={(e) => { e.stopPropagation(); setResizingId(b.id); }} />
                      <div className="absolute top-1/2 -left-1 transform -translate-y-1/2 w-3 h-3 bg-primary border border-white rounded-full cursor-w-resize" 
                           data-resize-handle="w"
                           onMouseDown={(e) => { e.stopPropagation(); setResizingId(b.id); }} />
                      <div className="absolute top-1/2 -right-1 transform -translate-y-1/2 w-3 h-3 bg-primary border border-white rounded-full cursor-e-resize" 
                           data-resize-handle="e"
                           onMouseDown={(e) => { e.stopPropagation(); setResizingId(b.id); }} />
                    </>
                  )}
                </div>
              ))}
              </div>
            )}
          </div>
          <div className="border-t p-2 text-center text-xs text-muted-foreground">Private notes</div>
        </main>

        <aside className="border-l p-3 space-y-4">
          {/* Tools panel - reserved for future use */}
        </aside>
        </div>
      )}
      
      {/* Bottom Action Buttons */}
      <div className="fixed bottom-4 right-4 flex flex-col gap-2">
        {/* Grid View Toggle */}
        <Button
          size="sm"
          variant="outline"
          className="rounded-full h-10 w-10 p-0 shadow-lg"
          onClick={() => setGridView(!gridView)}
          title={gridView ? "Exit grid view" : "Enter grid view"}
        >
          {gridView ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7"/>
              <rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="4"/>
              <rect x="3" y="11" width="18" height="4"/>
              <rect x="3" y="19" width="18" height="2"/>
            </svg>
          )}
        </Button>
        
        {/* Help Icon */}
        <Button
          size="sm"
          variant="outline"
          className="rounded-full h-10 w-10 p-0 shadow-lg"
          onClick={() => window.open('/help', '_blank')}
          title="Open Help Documentation"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10"/>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
            <circle cx="12" cy="17" r="1"/>
          </svg>
        </Button>
      </div>
    </div>
  );
}
