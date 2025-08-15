"use client";

import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getCollaborationManager } from '@/lib/collaboration';

interface Comment {
  id: string;
  slideId: number;
  x: number;
  y: number;
  text: string;
  userId: string;
  userName: string;
  timestamp: number;
  resolved?: boolean;
}

interface CommentsProps {
  currentSlideId: number;
  canvasRef: React.RefObject<HTMLDivElement | null>;
}

export function Comments({ currentSlideId, canvasRef }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState<{ x: number; y: number; active: boolean }>({ x: 0, y: 0, active: false });
  const [commentText, setCommentText] = useState('');
  const [selectedComment, setSelectedComment] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const collaborationManager = getCollaborationManager();

    const handleCommentAdded = (comment: Comment) => {
      setComments(prev => [...prev, comment]);
    };

    collaborationManager.on('comment_added', handleCommentAdded);

    return () => {
      collaborationManager.off('comment_added', handleCommentAdded);
    };
  }, []);

  useEffect(() => {
    if (newComment.active && inputRef.current) {
      inputRef.current.focus();
    }
  }, [newComment.active]);

  const handleCanvasDoubleClick = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    
    // Only add comments if Cmd/Ctrl is held
    if (!e.metaKey && !e.ctrlKey) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setNewComment({ x, y, active: true });
    setCommentText('');
  };

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    
    const collaborationManager = getCollaborationManager();
    const comment = collaborationManager.addComment(
      currentSlideId,
      newComment.x,
      newComment.y,
      commentText.trim()
    );
    
    if (comment) {
      setComments(prev => [...prev, comment]);
    }
    
    setNewComment({ x: 0, y: 0, active: false });
    setCommentText('');
  };

  const handleCancelComment = () => {
    setNewComment({ x: 0, y: 0, active: false });
    setCommentText('');
  };

  const resolveComment = (commentId: string) => {
    setComments(prev => 
      prev.map(comment => 
        comment.id === commentId 
          ? { ...comment, resolved: true }
          : comment
      )
    );
  };

  const currentSlideComments = comments.filter(comment => 
    comment.slideId === currentSlideId && !comment.resolved
  );

  return (
    <div
      className="absolute inset-0 pointer-events-none"
      onDoubleClick={handleCanvasDoubleClick}
    >
      {/* Existing comments */}
      {currentSlideComments.map(comment => (
        <div
          key={comment.id}
          className="absolute pointer-events-auto"
          style={{
            left: comment.x,
            top: comment.y,
            transform: 'translate(-8px, -8px)',
          }}
        >
          {/* Comment marker */}
          <div
            className={`w-6 h-6 rounded-full border-2 border-white shadow-lg cursor-pointer transition-all ${
              selectedComment === comment.id 
                ? 'bg-blue-600 scale-110' 
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
            onClick={() => setSelectedComment(
              selectedComment === comment.id ? null : comment.id
            )}
          >
            <div className="w-full h-full flex items-center justify-center">
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                className="text-white"
              >
                <path
                  d="M6 1C3.24 1 1 3.24 1 6C1 8.76 3.24 11 6 11C8.76 11 11 8.76 11 6C11 3.24 8.76 1 6 1ZM6 9C5.45 9 5 8.55 5 8C5 7.45 5.45 7 6 7C6.55 7 7 7.45 7 8C7 8.55 6.55 9 6 9ZM7 5H5V3H7V5Z"
                  fill="currentColor"
                />
              </svg>
            </div>
          </div>

          {/* Comment popup */}
          {selectedComment === comment.id && (
            <div
              className="absolute left-8 top-0 bg-white border rounded-lg shadow-lg p-3 max-w-xs z-10"
              style={{ minWidth: '250px' }}
            >
              <div className="text-xs font-medium text-muted-foreground mb-1">
                {comment.userName} • {new Date(comment.timestamp).toLocaleTimeString()}
              </div>
              <div className="text-sm mb-3">
                {comment.text}
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => resolveComment(comment.id)}
                  className="text-xs"
                >
                  Resolve
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedComment(null)}
                  className="text-xs"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* New comment input */}
      {newComment.active && (
        <div
          className="absolute pointer-events-auto"
          style={{
            left: newComment.x,
            top: newComment.y,
            transform: 'translate(-8px, -8px)',
          }}
        >
          {/* Comment marker */}
          <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-white shadow-lg animate-pulse" />
          
          {/* Comment input popup */}
          <div
            className="absolute left-8 top-0 bg-white border rounded-lg shadow-lg p-3 z-10"
            style={{ minWidth: '250px' }}
          >
            <div className="text-xs font-medium text-muted-foreground mb-2">
              Add a comment
            </div>
            <Input
              ref={inputRef}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Type your comment..."
              className="text-sm mb-3"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAddComment();
                } else if (e.key === 'Escape') {
                  handleCancelComment();
                }
              }}
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleAddComment}
                disabled={!commentText.trim()}
                className="text-xs"
              >
                Add Comment
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCancelComment}
                className="text-xs"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Instructions overlay */}
      {currentSlideComments.length === 0 && !newComment.active && (
        <div className="absolute bottom-4 left-4 bg-black/75 text-white text-xs px-3 py-2 rounded-lg pointer-events-auto">
          Hold Cmd/Ctrl and double-click to add comments
        </div>
      )}
    </div>
  );
}

export default Comments;
