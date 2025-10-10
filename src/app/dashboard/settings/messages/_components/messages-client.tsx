'use client';

import { useState } from 'react';
import { AppHeader } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Inbox, Send, Edit, Trash2, Star, Archive, Search, Plus, Mail, MailOpen, Reply, Forward, Paperclip, Clock, User } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import type { Employee } from '@/lib/types';
import { useLanguage } from '@/contexts/language-context';

interface Message {
  id: string;
  from: string;
  fromName: string;
  to: string;
  toName: string;
  subject: string;
  content: string;
  date: string;
  isRead: boolean;
  isStarred: boolean;
  hasAttachments: boolean;
  attachments?: string[];
  category: 'inbox' | 'sent' | 'draft' | 'archived';
}

// بيانات وهمية للرسائل
const mockMessages: Message[] = [
  {
    id: 'msg-001',
    from: 'admin@estateflow.com',
    fromName: 'Admin User',
    to: 'uaq907@gmail.com',
    toName: 'UAQ907',
    subject: 'تحديث: نهاية عقد إيجار - فيلا الشاطئ الذهبي',
    content: 'تنبيه: ينتهي عقد الإيجار للمستأجر محمد عبدالله العتيبي في فيلا الشاطئ الذهبي بتاريخ 31/01/2025. يرجى التواصل لتجديد العقد أو ترتيب الإخلاء.',
    date: new Date(2025, 9, 9).toISOString(),
    isRead: false,
    isStarred: true,
    hasAttachments: false,
    category: 'inbox'
  },
  {
    id: 'msg-002',
    from: 'manager@oligo.ae',
    fromName: 'Property Manager',
    to: 'uaq907@gmail.com',
    toName: 'UAQ907',
    subject: 'تذكير: شيك مستحق - شركة التكييف والتهوية',
    content: 'تذكير باستحقاق شيك بمبلغ 44,444.00 درهم لصالح شركة التكييف والتهوية بتاريخ 15/10/2025.',
    date: new Date(2025, 9, 8).toISOString(),
    isRead: true,
    isStarred: false,
    hasAttachments: false,
    category: 'inbox'
  },
  {
    id: 'msg-003',
    from: 'uaq907@gmail.com',
    fromName: 'UAQ907',
    to: 'admin@estateflow.com',
    toName: 'Admin User',
    subject: 'موافقة: طلب مصروف - صيانة مكيفات',
    content: 'تمت الموافقة على طلب المصروف رقم EXP-2025-001 بمبلغ 2,500 درهم لصيانة مكيفات برج مارينا الشاطئ.',
    date: new Date(2025, 9, 7).toISOString(),
    isRead: true,
    isStarred: false,
    hasAttachments: false,
    category: 'sent'
  }
];

export default function MessagesClient({ employee }: { employee: Employee }) {
  const { t, language } = useLanguage();
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [selectedCategory, setSelectedCategory] = useState<'inbox' | 'sent' | 'draft' | 'archived'>('inbox');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // حالة رسالة جديدة
  const [newMessage, setNewMessage] = useState({
    to: '',
    subject: '',
    content: '',
    attachments: [] as File[]
  });

  // تصفية الرسائل حسب الفئة والبحث
  const filteredMessages = messages.filter(msg => {
    const matchesCategory = msg.category === selectedCategory;
    const matchesSearch = 
      msg.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.fromName.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  // عدد الرسائل غير المقروءة
  const unreadCount = messages.filter(msg => !msg.isRead && msg.category === 'inbox').length;

  // معالج إرسال رسالة جديدة
  const handleSendMessage = () => {
    if (!newMessage.to || !newMessage.subject || !newMessage.content) {
      alert('⚠️ يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    const message: Message = {
      id: `msg-${Date.now()}`,
      from: employee.email,
      fromName: employee.name,
      to: newMessage.to,
      toName: newMessage.to,
      subject: newMessage.subject,
      content: newMessage.content,
      date: new Date().toISOString(),
      isRead: true,
      isStarred: false,
      hasAttachments: newMessage.attachments.length > 0,
      category: 'sent'
    };

    setMessages([...messages, message]);
    setIsComposeOpen(false);
    setNewMessage({ to: '', subject: '', content: '', attachments: [] });
    alert('✅ تم إرسال الرسالة بنجاح!');
  };

  // معالج تحديد الرسالة
  const handleSelectMessage = (msg: Message) => {
    setSelectedMessage(msg);
    if (!msg.isRead && msg.category === 'inbox') {
      setMessages(messages.map(m => m.id === msg.id ? { ...m, isRead: true } : m));
    }
  };

  // معالج وضع علامة نجمة
  const handleToggleStar = (msgId: string) => {
    setMessages(messages.map(m => m.id === msgId ? { ...m, isStarred: !m.isStarred } : m));
  };

  // معالج حذف رسالة
  const handleDeleteMessage = (msgId: string) => {
    if (confirm('هل أنت متأكد من حذف هذه الرسالة؟')) {
      setMessages(messages.filter(m => m.id !== msgId));
      setSelectedMessage(null);
      alert('✅ تم حذف الرسالة');
    }
  };

  return (
    <>
      <AppHeader employee={employee} />
      <main className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">📬 البريد الداخلي</h1>
          <p className="text-gray-600">إدارة الرسائل والتواصل الداخلي بين الموظفين</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* الشريط الجانبي */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <Button onClick={() => setIsComposeOpen(true)} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  رسالة جديدة
                </Button>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant={selectedCategory === 'inbox' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setSelectedCategory('inbox')}
                >
                  <Inbox className="h-4 w-4 mr-2" />
                  صندوق الوارد
                  {unreadCount > 0 && (
                    <Badge className="mr-auto" variant="destructive">
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
                
                <Button
                  variant={selectedCategory === 'sent' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setSelectedCategory('sent')}
                >
                  <Send className="h-4 w-4 mr-2" />
                  الصادر
                </Button>
                
                <Button
                  variant={selectedCategory === 'draft' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setSelectedCategory('draft')}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  المسودات
                </Button>
                
                <Button
                  variant={selectedCategory === 'archived' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setSelectedCategory('archived')}
                >
                  <Archive className="h-4 w-4 mr-2" />
                  الأرشيف
                </Button>
              </CardContent>
            </Card>

            {/* إحصائيات سريعة */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-sm">إحصائيات</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">الوارد:</span>
                  <span className="font-bold">{messages.filter(m => m.category === 'inbox').length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">الصادر:</span>
                  <span className="font-bold">{messages.filter(m => m.category === 'sent').length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">غير المقروءة:</span>
                  <span className="font-bold text-red-600">{unreadCount}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* قائمة الرسائل والمحتوى */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>
                      {selectedCategory === 'inbox' && '📥 صندوق الوارد'}
                      {selectedCategory === 'sent' && '📤 الصادر'}
                      {selectedCategory === 'draft' && '📝 المسودات'}
                      {selectedCategory === 'archived' && '📦 الأرشيف'}
                    </CardTitle>
                    <CardDescription>
                      {filteredMessages.length} رسالة
                    </CardDescription>
                  </div>
                  
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="بحث في الرسائل..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pr-10 w-64"
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* قائمة الرسائل */}
                  <ScrollArea className="h-[600px] border rounded-lg">
                    {filteredMessages.length === 0 ? (
                      <div className="p-8 text-center text-gray-500">
                        <Mail className="h-12 w-12 mx-auto mb-4 opacity-20" />
                        <p>لا توجد رسائل</p>
                      </div>
                    ) : (
                      <div className="divide-y">
                        {filteredMessages.map((msg) => (
                          <div
                            key={msg.id}
                            onClick={() => handleSelectMessage(msg)}
                            className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                              selectedMessage?.id === msg.id ? 'bg-blue-50 border-r-4 border-blue-500' : ''
                            } ${!msg.isRead && msg.category === 'inbox' ? 'bg-blue-50/30' : ''}`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  {!msg.isRead && msg.category === 'inbox' && (
                                    <div className="h-2 w-2 bg-blue-600 rounded-full flex-shrink-0"></div>
                                  )}
                                  <p className={`font-medium truncate ${!msg.isRead && msg.category === 'inbox' ? 'font-bold' : ''}`}>
                                    {selectedCategory === 'sent' ? msg.toName : msg.fromName}
                                  </p>
                                  <div className="flex gap-1 mr-auto flex-shrink-0">
                                    {msg.isStarred && <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />}
                                    {msg.hasAttachments && <Paperclip className="h-3 w-3 text-gray-400" />}
                                  </div>
                                </div>
                                <p className={`text-sm truncate ${!msg.isRead && msg.category === 'inbox' ? 'font-semibold' : 'text-gray-700'}`}>
                                  {msg.subject}
                                </p>
                                <p className="text-xs text-gray-500 truncate mt-1">
                                  {msg.content.substring(0, 80)}...
                                </p>
                                <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {format(new Date(msg.date), 'dd/MM/yyyy - hh:mm a', { locale: ar })}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>

                  {/* محتوى الرسالة */}
                  <ScrollArea className="h-[600px] border rounded-lg">
                    {selectedMessage ? (
                      <div className="p-6">
                        {/* رأس الرسالة */}
                        <div className="mb-6">
                          <div className="flex items-start justify-between mb-4">
                            <h3 className="text-xl font-bold">{selectedMessage.subject}</h3>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleStar(selectedMessage.id)}
                              >
                                <Star className={`h-4 w-4 ${selectedMessage.isStarred ? 'text-yellow-500 fill-yellow-500' : ''}`} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteMessage(selectedMessage.id)}
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          </div>
                          
                          <Separator className="my-4" />
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-600">من:</span>
                              <span className="font-medium">{selectedMessage.fromName}</span>
                              <span className="text-gray-400">({selectedMessage.from})</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-600">إلى:</span>
                              <span className="font-medium">{selectedMessage.toName}</span>
                              <span className="text-gray-400">({selectedMessage.to})</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-600">التاريخ:</span>
                              <span>{format(new Date(selectedMessage.date), 'dd MMMM yyyy - hh:mm a', { locale: ar })}</span>
                            </div>
                          </div>
                        </div>

                        <Separator className="my-4" />

                        {/* محتوى الرسالة */}
                        <div className="prose max-w-none">
                          <p className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                            {selectedMessage.content}
                          </p>
                        </div>

                        {/* المرفقات */}
                        {selectedMessage.hasAttachments && (
                          <div className="mt-6">
                            <Separator className="my-4" />
                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                              <Paperclip className="h-4 w-4" />
                              المرفقات
                            </h4>
                            <div className="space-y-2">
                              {selectedMessage.attachments?.map((att, idx) => (
                                <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                                  <Paperclip className="h-4 w-4" />
                                  <span className="text-sm">{att}</span>
                                  <Button variant="ghost" size="sm" className="mr-auto">
                                    تحميل
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* أزرار الإجراءات */}
                        {selectedCategory === 'inbox' && (
                          <div className="mt-6 flex gap-2">
                            <Button variant="outline" size="sm">
                              <Reply className="h-4 w-4 mr-2" />
                              رد
                            </Button>
                            <Button variant="outline" size="sm">
                              <Forward className="h-4 w-4 mr-2" />
                              إعادة توجيه
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center text-gray-400">
                        <div className="text-center">
                          <MailOpen className="h-16 w-16 mx-auto mb-4 opacity-20" />
                          <p>اختر رسالة لعرضها</p>
                        </div>
                      </div>
                    )}
                  </ScrollArea>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* نافذة إنشاء رسالة جديدة */}
        <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                رسالة جديدة
              </DialogTitle>
              <DialogDescription>
                إرسال رسالة إلى موظف آخر في النظام
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="to">إلى (البريد الإلكتروني) *</Label>
                <Input
                  id="to"
                  type="email"
                  placeholder="admin@estateflow.com"
                  value={newMessage.to}
                  onChange={(e) => setNewMessage({ ...newMessage, to: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="subject">الموضوع *</Label>
                <Input
                  id="subject"
                  placeholder="موضوع الرسالة"
                  value={newMessage.subject}
                  onChange={(e) => setNewMessage({ ...newMessage, subject: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="content">المحتوى *</Label>
                <Textarea
                  id="content"
                  placeholder="اكتب محتوى الرسالة هنا..."
                  value={newMessage.content}
                  onChange={(e) => setNewMessage({ ...newMessage, content: e.target.value })}
                  rows={10}
                  className="resize-none"
                />
              </div>

              <div>
                <Label htmlFor="attachments">المرفقات (اختياري)</Label>
                <Input
                  id="attachments"
                  type="file"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setNewMessage({ ...newMessage, attachments: files });
                  }}
                />
                {newMessage.attachments.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    {newMessage.attachments.length} ملف مُرفق
                  </p>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsComposeOpen(false)}>
                إلغاء
              </Button>
              <Button onClick={handleSendMessage}>
                <Send className="h-4 w-4 mr-2" />
                إرسال
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </>
  );
}

