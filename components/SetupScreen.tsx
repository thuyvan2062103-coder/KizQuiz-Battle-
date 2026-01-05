import React, { useState, useRef, useEffect } from 'react';
import { GameSettings, Question } from '../types';
import { DEFAULT_QUESTIONS } from '../constants';
import { Play, Plus, Trash2, Image as ImageIcon, Edit2, Upload, X, Save, Download, FileJson } from 'lucide-react';

interface SetupScreenProps {
  onStartGame: (settings: GameSettings) => void;
}

const SetupScreen: React.FC<SetupScreenProps> = ({ onStartGame }) => {
  const [team1Name, setTeam1Name] = useState('Đội Sóc Nâu');
  const [team2Name, setTeam2Name] = useState('Đội Thỏ Trắng');
  const [timePerQuestion, setTimePerQuestion] = useState(15);
  
  // Initialize questions from LocalStorage or default with robust ID checking
  const [questions, setQuestions] = useState<Question[]>(() => {
    try {
      const saved = localStorage.getItem('kidquiz_questions');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
            // Ensure every loaded question has a valid String ID
            return parsed.map((q: any, index: number) => ({
                ...q,
                id: q.id ? String(q.id) : `q-${Date.now()}-${index}`,
                options: Array.isArray(q.options) ? q.options : ['', '', '', ''],
                correctIndex: typeof q.correctIndex === 'number' ? q.correctIndex : 0
            }));
        }
      }
    } catch (e) {
      console.error("Failed to load questions", e);
    }
    return DEFAULT_QUESTIONS;
  });
  
  // Save questions to LocalStorage whenever they change
  useEffect(() => {
    localStorage.setItem('kidquiz_questions', JSON.stringify(questions));
  }, [questions]);

  // Editing state
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);

  // Form state
  const [newQText, setNewQText] = useState('');
  const [newQImage, setNewQImage] = useState('');
  const [newQOptions, setNewQOptions] = useState(['', '', '', '']);
  const [newQCorrect, setNewQCorrect] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const jsonInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const handleStart = () => {
    if (questions.length === 0) {
      alert("Vui lòng thêm ít nhất 1 câu hỏi!");
      return;
    }
    onStartGame({
      team1Name,
      team2Name,
      timePerQuestion,
      questions
    });
  };

  // Clear all questions
  const handleClearAll = () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa TẤT CẢ câu hỏi? Hành động này không thể hoàn tác.")) {
      setQuestions([]);
      resetForm();
    }
  };

  // --- Import / Export Logic ---
  const handleExportData = () => {
    if (questions.length === 0) {
        alert("Chưa có câu hỏi nào để lưu!");
        return;
    }
    const dataStr = JSON.stringify(questions, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `bo-cau-hoi-kidquiz-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
      jsonInputRef.current?.click();
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
          try {
              const json = JSON.parse(event.target?.result as string);
              if (Array.isArray(json)) {
                  const isValid = json.every(q => q.text && Array.isArray(q.options));
                  if (isValid) {
                      if (window.confirm(`Tìm thấy ${json.length} câu hỏi. Bạn có muốn thay thế danh sách hiện tại không?`)) {
                          // Assign IDs if missing during import
                          const importedQuestions = json.map((q: any, idx: number) => ({
                              ...q,
                              id: q.id ? String(q.id) : `import-${Date.now()}-${idx}`
                          }));
                          setQuestions(importedQuestions);
                          alert("Đã nạp câu hỏi thành công!");
                      }
                  } else {
                      alert("File không hợp lệ. Vui lòng chọn file JSON đúng định dạng.");
                  }
              }
          } catch (err) {
              alert("Lỗi đọc file. Vui lòng thử lại.");
              console.error(err);
          }
          if (jsonInputRef.current) jsonInputRef.current.value = '';
      };
      reader.readAsText(file);
  };

  // Image Handling
  const handleImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
        alert("Vui lòng chọn file hình ảnh.");
        return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setNewQImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleImageFile(e.target.files[0]);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile();
        if (blob) handleImageFile(blob);
      }
    }
  };

  const saveQuestion = () => {
    if (!newQText || newQOptions.some(o => !o)) {
      alert("Vui lòng nhập đầy đủ câu hỏi và 4 đáp án.");
      return;
    }

    const questionData: Question = {
      id: editingQuestionId || Date.now().toString(),
      text: newQText,
      image: newQImage || undefined,
      options: [...newQOptions],
      correctIndex: newQCorrect
    };

    if (editingQuestionId) {
      setQuestions(questions.map(q => q.id === editingQuestionId ? questionData : q));
      setEditingQuestionId(null);
    } else {
      setQuestions([...questions, questionData]);
    }

    resetForm();
  };

  const resetForm = () => {
    setNewQText('');
    setNewQImage('');
    setNewQOptions(['', '', '', '']);
    setNewQCorrect(0);
    setEditingQuestionId(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const startEdit = (q: Question) => {
    setEditingQuestionId(q.id);
    setNewQText(q.text);
    setNewQImage(q.image || '');
    setNewQOptions([...q.options]);
    setNewQCorrect(q.correctIndex);
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  // Immediate delete for the list item (no confirmation dialog)
  const quickDeleteQuestion = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    setQuestions(prevQuestions => prevQuestions.filter(q => String(q.id) !== String(id)));
    if (editingQuestionId && String(editingQuestionId) === String(id)) {
        resetForm();
    }
  };

  // Confirmed delete for the edit form button
  const deleteWithConfirm = (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa câu hỏi này?")) {
        setQuestions(prevQuestions => prevQuestions.filter(q => String(q.id) !== String(id)));
        if (editingQuestionId && String(editingQuestionId) === String(id)) {
            resetForm();
        }
    }
  };

  return (
    <div className="min-h-screen bg-indigo-50 font-sans pb-32">
      <div className="max-w-4xl mx-auto bg-white min-h-screen shadow-xl overflow-hidden relative">
        <div className="bg-yellow-400 p-6 text-center sticky top-0 z-10 shadow-md">
          <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-md">Cài Đặt Trò Chơi</h1>
          <p className="text-yellow-800 mt-2 font-medium">Chuẩn bị thử thách cho các bé!</p>
        </div>

        <div className="p-4 md:p-8 space-y-8">
          {/* General Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <div className="space-y-2">
              <label className="block text-gray-700 font-bold">Tên Đội 1 (Trái)</label>
              <input
                type="text"
                value={team1Name}
                onChange={(e) => setTeam1Name(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border-2 border-blue-200 focus:border-blue-500 outline-none transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-gray-700 font-bold">Thời gian (giây)</label>
              <select
                value={timePerQuestion}
                onChange={(e) => setTimePerQuestion(Number(e.target.value))}
                className="w-full px-4 py-2 rounded-xl border-2 border-yellow-200 focus:border-yellow-500 outline-none"
              >
                <option value={5}>5 giây</option>
                <option value={10}>10 giây</option>
                <option value={15}>15 giây</option>
                <option value={20}>20 giây</option>
                <option value={30}>30 giây</option>
                <option value={45}>45 giây</option>
                <option value={60}>60 giây</option>
                <option value={90}>90 giây</option>
                <option value={120}>120 giây</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-gray-700 font-bold">Tên Đội 2 (Phải)</label>
              <input
                type="text"
                value={team2Name}
                onChange={(e) => setTeam2Name(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border-2 border-pink-200 focus:border-pink-500 outline-none transition-colors"
              />
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Question Builder */}
          <div ref={formRef} className="bg-gray-50 p-6 rounded-2xl border-2 border-dashed border-gray-300">
             <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-600">
                    {editingQuestionId ? 'Chỉnh sửa câu hỏi' : 'Thêm câu hỏi mới'}
                </h3>
                {editingQuestionId && (
                    <button type="button" onClick={resetForm} className="text-sm text-red-500 hover:underline flex items-center gap-1">
                        <X size={16} /> Hủy chỉnh sửa
                    </button>
                )}
             </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-500">Nội dung câu hỏi (Paste ảnh vào ô này cũng được)</label>
                    <textarea
                    placeholder="Nhập nội dung câu hỏi..."
                    value={newQText}
                    onChange={e => setNewQText(e.target.value)}
                    onPaste={handlePaste}
                    className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-yellow-400 outline-none min-h-[80px]"
                    />
                </div>

                {/* Image Upload Area */}
                <div className="space-y-2">
                     <label className="text-sm font-semibold text-gray-500">Hình ảnh đính kèm (Tùy chọn)</label>
                     <div className="flex flex-col md:flex-row gap-4 items-start">
                        {newQImage ? (
                            <div className="relative group">
                                <img src={newQImage} alt="Preview" className="h-32 w-auto rounded-lg border border-gray-300 shadow-sm" />
                                <button 
                                    type="button"
                                    onClick={() => setNewQImage('')}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ) : (
                            <div className="flex-1 w-full border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-gray-400 bg-white hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                <ImageIcon size={32} className="mb-2" />
                                <span className="text-sm">Click để tải ảnh hoặc dán (Ctrl+V) vào ô câu hỏi</span>
                            </div>
                        )}
                        
                        <input 
                            type="file" 
                            ref={fileInputRef}
                            accept="image/*" 
                            className="hidden"
                            onChange={handleFileChange}
                        />
                         <div className="flex-1 w-full">
                            <div className="flex gap-2">
                                <button 
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-bold flex items-center gap-2"
                                >
                                    <Upload size={16} /> Tải ảnh lên
                                </button>
                                <input
                                    placeholder="Hoặc dán link ảnh vào đây..."
                                    value={newQImage}
                                    onChange={e => setNewQImage(e.target.value)}
                                    className="flex-1 p-2 rounded-lg border border-gray-200 text-sm"
                                />
                            </div>
                         </div>
                     </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {newQOptions.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div 
                        onClick={() => setNewQCorrect(idx)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer border-2 ${newQCorrect === idx ? 'border-green-500 bg-green-50 text-green-600' : 'border-gray-300 text-gray-300'}`}
                      >
                          {String.fromCharCode(65 + idx)}
                      </div>
                      <input
                        placeholder={`Đáp án ${String.fromCharCode(65 + idx)}`}
                        value={opt}
                        onChange={(e) => {
                          const newOpts = [...newQOptions];
                          newOpts[idx] = e.target.value;
                          setNewQOptions(newOpts);
                        }}
                        className={`flex-1 p-3 rounded-lg border ${newQCorrect === idx ? 'border-green-400 bg-green-50' : 'border-gray-200'}`}
                      />
                    </div>
                  ))}
                </div>
                
                <div className="flex gap-3">
                  {editingQuestionId && (
                    <button
                      type="button"
                      onClick={() => deleteWithConfirm(editingQuestionId)}
                      className="px-6 py-3 bg-red-100 text-red-600 hover:bg-red-200 rounded-xl font-bold flex items-center gap-2 transition-colors"
                    >
                      <Trash2 size={20} /> Xóa
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={saveQuestion}
                    className={`flex-1 py-3 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md
                      ${editingQuestionId ? 'bg-orange-500 hover:bg-orange-600' : 'bg-green-500 hover:bg-green-600'}
                    `}
                  >
                    {editingQuestionId ? <><Save size={20} /> Lưu Thay Đổi</> : <><Plus size={20} /> Thêm Câu Hỏi</>}
                  </button>
                </div>
              </div>
          </div>

          <div>
             <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                 <h2 className="text-2xl font-bold text-gray-800">Danh Sách Câu Hỏi ({questions.length})</h2>
                 
                 <div className="flex gap-2">
                     <input 
                         type="file" 
                         ref={jsonInputRef} 
                         accept=".json" 
                         className="hidden" 
                         onChange={handleImportFile} 
                     />
                     <button 
                        onClick={handleImportClick}
                        className="text-sm text-blue-600 hover:bg-blue-50 border border-blue-200 px-3 py-2 rounded-lg flex items-center gap-1 transition-colors"
                        title="Tải bộ câu hỏi đã lưu từ máy tính"
                     >
                        <Upload size={16} /> Nạp File
                     </button>
                     <button 
                        onClick={handleExportData}
                        className="text-sm text-green-600 hover:bg-green-50 border border-green-200 px-3 py-2 rounded-lg flex items-center gap-1 transition-colors"
                        title="Lưu bộ câu hỏi về máy tính"
                     >
                        <Download size={16} /> Lưu File
                     </button>
                     <button 
                        onClick={handleClearAll}
                        className="text-sm text-red-500 hover:bg-red-50 border border-red-200 px-3 py-2 rounded-lg flex items-center gap-1 transition-colors"
                     >
                        <Trash2 size={16} /> Xóa tất cả
                     </button>
                 </div>
             </div>
             
             <div className="space-y-3 pb-8">
              {questions.map((q, i) => (
                <div key={q.id} className={`flex flex-col md:flex-row items-start md:items-center justify-between p-4 bg-white border rounded-xl shadow-sm hover:shadow-md transition-shadow ${editingQuestionId === q.id ? 'border-orange-400 ring-2 ring-orange-100' : 'border-gray-100'}`}>
                  <div className="flex items-start gap-4 flex-1">
                    <span className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-gray-100 rounded-full font-bold text-gray-500 mt-1">
                      {i + 1}
                    </span>
                    <div className="flex-1">
                      <div className="flex gap-3">
                          {q.image && <img src={q.image} alt="thumb" className="w-16 h-16 object-cover rounded-md border border-gray-200" />}
                          <div>
                            <p className="font-bold text-gray-800 line-clamp-2">{q.text}</p>
                            <p className="text-sm text-green-600 font-medium mt-1">Đáp án: {q.options[q.correctIndex]}</p>
                          </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4 md:mt-0 self-end md:self-center">
                    <button 
                        type="button"
                        onClick={() => startEdit(q)}
                        className="p-3 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Sửa"
                    >
                        <Edit2 size={18} />
                    </button>
                    <button 
                        type="button"
                        onClick={(e) => quickDeleteQuestion(e, q.id)}
                        className="p-3 text-red-500 bg-red-50 hover:bg-red-100 hover:text-red-600 rounded-lg transition-colors z-20 border border-red-100 shadow-sm"
                        title="Xóa câu hỏi này"
                    >
                        <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
              {questions.length === 0 && (
                  <div className="text-center p-8 text-gray-400 italic bg-gray-50 rounded-xl border border-dashed border-gray-300">
                      Chưa có câu hỏi nào. Hãy thêm câu hỏi ở trên hoặc "Nạp File" nếu đã có!
                  </div>
              )}
            </div>
          </div>
        </div>

        {/* Fixed Bottom Action Bar */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-gray-200 flex justify-center z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
          <button
            type="button"
            onClick={handleStart}
            className="w-full max-w-md px-12 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xl font-bold rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            <Play fill="currentColor" /> BẮT ĐẦU TRÒ CHƠI
          </button>
        </div>
      </div>
    </div>
  );
};

export default SetupScreen;