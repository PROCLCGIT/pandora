// /pandora/src/modulos/brief/components/BriefComments.jsx

import React, { useState } from 'react';
import { 
  MessageSquare, 
  Send, 
  MoreVertical,
  Edit,
  Trash2,
  Reply,
  Heart,
  Pin,
  Flag,
  Clock,
  User,
  Check,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

const BriefComments = ({ briefId }) => {
  const [comments, setComments] = useState([
    {
      id: 1,
      content: "He revisado los requerimientos del cliente y todo parece estar en orden. Podemos proceder con la cotización.",
      author: "María González",
      authorRole: "Gerente de Ventas",
      createdAt: "2025-01-02T10:30:00Z",
      isEdited: false,
      isPinned: false,
      likes: 2,
      replies: [
        {
          id: 11,
          content: "Perfecto, ya tengo los precios actualizados. Lo envío en una hora.",
          author: "Carlos Ruiz",
          authorRole: "Analista de Precios",
          createdAt: "2025-01-02T11:15:00Z",
          isEdited: false
        }
      ]
    },
    {
      id: 2,
      content: "¿Podríamos verificar la disponibilidad del item #3? El cliente preguntó específicamente por esa marca.",
      author: "Ana López",
      authorRole: "Ejecutiva de Cuentas",
      createdAt: "2025-01-02T14:20:00Z",
      isEdited: true,
      isPinned: true,
      likes: 0,
      replies: []
    }
  ]);
  
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const [editText, setEditText] = useState('');

  // Usuario actual (simulado)
  const currentUser = {
    name: "Usuario Actual",
    role: "Operador"
  };

  const formatRelativeTime = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
      
      if (diffInHours < 1) return 'Hace menos de 1 hora';
      if (diffInHours < 24) return `Hace ${diffInHours} horas`;
      
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) return `Hace ${diffInDays} días`;
      
      return format(date, "dd MMM", { locale: es });
    } catch {
      return dateString;
    }
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    
    const comment = {
      id: Date.now(),
      content: newComment,
      author: currentUser.name,
      authorRole: currentUser.role,
      createdAt: new Date().toISOString(),
      isEdited: false,
      isPinned: false,
      likes: 0,
      replies: []
    };
    
    setComments([comment, ...comments]);
    setNewComment('');
  };

  const handleAddReply = (commentId) => {
    if (!replyText.trim()) return;
    
    const reply = {
      id: Date.now(),
      content: replyText,
      author: currentUser.name,
      authorRole: currentUser.role,
      createdAt: new Date().toISOString(),
      isEdited: false
    };
    
    setComments(comments.map(comment => 
      comment.id === commentId 
        ? { ...comment, replies: [...comment.replies, reply] }
        : comment
    ));
    
    setReplyText('');
    setReplyingTo(null);
  };

  const handleEditComment = (commentId) => {
    if (!editText.trim()) return;
    
    setComments(comments.map(comment => 
      comment.id === commentId 
        ? { ...comment, content: editText, isEdited: true }
        : comment
    ));
    
    setEditingComment(null);
    setEditText('');
  };

  const handleDeleteComment = (commentId) => {
    setComments(comments.filter(comment => comment.id !== commentId));
  };

  const handleLikeComment = (commentId) => {
    setComments(comments.map(comment => 
      comment.id === commentId 
        ? { ...comment, likes: comment.likes + 1 }
        : comment
    ));
  };

  const handlePinComment = (commentId) => {
    setComments(comments.map(comment => 
      comment.id === commentId 
        ? { ...comment, isPinned: !comment.isPinned }
        : comment
    ));
  };

  const CommentItem = ({ comment, isReply = false }) => {
    const isEditing = editingComment === comment.id;
    const isReplying = replyingTo === comment.id;
    
    return (
      <div className={`${isReply ? 'ml-12 border-l-2 border-gray-200 pl-4' : ''}`}>
        <div className="flex gap-3 group">
          {/* Avatar */}
          <Avatar className="w-8 h-8 shrink-0">
            <AvatarFallback className="bg-blue-100 text-blue-800 text-sm">
              {comment.author.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          {/* Contenido */}
          <div className="flex-1 min-w-0">
            <div className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors">
              {/* Header del comentario */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900 text-sm">
                    {comment.author}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {comment.authorRole}
                  </Badge>
                  {comment.isPinned && (
                    <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                      <Pin className="w-3 h-3 mr-1" />
                      Fijado
                    </Badge>
                  )}
                  <span className="text-xs text-gray-500">
                    {formatRelativeTime(comment.createdAt)}
                  </span>
                  {comment.isEdited && (
                    <span className="text-xs text-gray-400">(editado)</span>
                  )}
                </div>
                
                {/* Menu de acciones */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                    >
                      <MoreVertical className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    {!isReply && (
                      <>
                        <DropdownMenuItem onClick={() => handlePinComment(comment.id)}>
                          <Pin className="mr-2 h-3 w-3" />
                          {comment.isPinned ? 'Desfijar' : 'Fijar'}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <DropdownMenuItem 
                      onClick={() => {
                        setEditingComment(comment.id);
                        setEditText(comment.content);
                      }}
                    >
                      <Edit className="mr-2 h-3 w-3" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Flag className="mr-2 h-3 w-3" />
                      Reportar
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-red-600"
                      onClick={() => handleDeleteComment(comment.id)}
                    >
                      <Trash2 className="mr-2 h-3 w-3" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              {/* Contenido del comentario */}
              {isEditing ? (
                <div className="space-y-2">
                  <Textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="min-h-16 text-sm"
                    placeholder="Editar comentario..."
                  />
                  <div className="flex justify-end gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        setEditingComment(null);
                        setEditText('');
                      }}
                    >
                      <X className="h-3 w-3 mr-1" />
                      Cancelar
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => handleEditComment(comment.id)}
                    >
                      <Check className="h-3 w-3 mr-1" />
                      Guardar
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-700 text-sm leading-relaxed">
                  {comment.content}
                </p>
              )}
            </div>
            
            {/* Acciones del comentario */}
            {!isEditing && (
              <div className="flex items-center gap-4 mt-2 ml-3">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 text-xs text-gray-500 hover:text-red-600 p-0"
                  onClick={() => handleLikeComment(comment.id)}
                >
                  <Heart className="h-3 w-3 mr-1" />
                  {comment.likes > 0 && comment.likes}
                </Button>
                
                {!isReply && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 text-xs text-gray-500 hover:text-blue-600 p-0"
                    onClick={() => setReplyingTo(comment.id)}
                  >
                    <Reply className="h-3 w-3 mr-1" />
                    Responder
                  </Button>
                )}
              </div>
            )}
            
            {/* Formulario de respuesta */}
            {isReplying && (
              <div className="mt-3 ml-3 space-y-2">
                <Textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="min-h-16 text-sm"
                  placeholder="Escribe tu respuesta..."
                />
                <div className="flex justify-end gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      setReplyingTo(null);
                      setReplyText('');
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => handleAddReply(comment.id)}
                    disabled={!replyText.trim()}
                  >
                    <Send className="h-3 w-3 mr-1" />
                    Responder
                  </Button>
                </div>
              </div>
            )}
            
            {/* Respuestas */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="mt-3 space-y-3">
                {comment.replies.map((reply) => (
                  <CommentItem key={reply.id} comment={reply} isReply={true} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const totalComments = comments.reduce((total, comment) => 
    total + 1 + (comment.replies ? comment.replies.length : 0), 0
  );

  const pinnedComments = comments.filter(comment => comment.isPinned);
  const regularComments = comments.filter(comment => !comment.isPinned);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            Comentarios y Discusión
            <Badge variant="outline">{totalComments}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Formulario para nuevo comentario */}
          <div className="space-y-3">
            <div className="flex gap-3">
              <Avatar className="w-8 h-8 shrink-0">
                <AvatarFallback className="bg-green-100 text-green-800 text-sm">
                  {currentUser.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Escribe un comentario sobre este brief..."
                  className="min-h-20 resize-none"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button 
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Send className="h-4 w-4 mr-2" />
                Publicar Comentario
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comentarios fijados */}
      {pinnedComments.length > 0 && (
        <Card className="border-0 shadow-md border-l-4 border-l-yellow-400">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <Pin className="h-4 w-4" />
              Comentarios Fijados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {pinnedComments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Lista de comentarios */}
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-blue-600" />
              Conversación
              <Badge variant="outline">{regularComments.length}</Badge>
            </CardTitle>
            <div className="text-sm text-gray-500">
              {totalComments} comentarios en total
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {regularComments.length > 0 ? (
            <div className="space-y-6">
              {regularComments.map((comment) => (
                <CommentItem key={comment.id} comment={comment} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No hay comentarios aún
              </h3>
              <p className="text-gray-500">
                Sé el primero en comentar sobre este brief.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Información adicional */}
      <Alert>
        <MessageSquare className="h-4 w-4" />
        <AlertDescription>
          Los comentarios son visibles para todos los miembros del equipo que tengan acceso a este brief.
          Usa @menciones para notificar a usuarios específicos.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default BriefComments;
