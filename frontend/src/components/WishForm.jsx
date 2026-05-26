import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function WishForm({ onAddWish }) {
  const [username, setUsername] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !content) return;
    
    setIsSubmitting(true);

    try {
      const { data, error } = await supabase
        .from('wishes')
        .insert([{ threads_username: username, content: content }])
        .select();

      if (error) {
        console.error("Lỗi khi gửi lời chúc:", error);
        alert("Bạn chưa cấu hình Supabase! Vui lòng làm theo hướng dẫn để kết nối cơ sở dữ liệu thực.");
        
        // Fallback tạm thời nếu chưa có DB
        onAddWish({
          id: Date.now().toString(),
          threads_username: username,
          content: content,
          likes_count: 0,
          created_at: new Date().toISOString()
        });
        setUsername('');
        setContent('');
      } else if (data && data.length > 0) {
        onAddWish(data[0]);
        setUsername('');
        setContent('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="liquid-glass p-5 sm:p-6 md:p-8 mb-8 [@media(max-height:500px)]:!p-3 [@media(max-height:500px)]:!mb-2 [@media(max-height:500px)]:mt-auto w-[95%] sm:w-[90%] md:w-full max-w-2xl mx-auto transform transition-all duration-500 focus-within:-translate-y-[20vh] md:focus-within:translate-y-0 [@media(max-height:500px)]:focus-within:translate-y-0">
      <h2 className="text-2xl sm:text-3xl [@media(max-height:500px)]:!text-base font-extrabold text-center mb-6 md:mb-8 [@media(max-height:500px)]:!mb-3 text-white drop-shadow-sm uppercase tracking-widest">
        GỬI LỜI CHÚC
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 [@media(max-height:500px)]:!space-y-0 [@media(max-height:500px)]:flex [@media(max-height:500px)]:flex-row [@media(max-height:500px)]:gap-2 [@media(max-height:500px)]:items-end">
        <div className="form-control [@media(max-height:500px)]:flex-1">
          <label className="label [@media(max-height:500px)]:!py-0 [@media(max-height:500px)]:!mb-1">
            <span className="label-text font-bold text-gray-200 uppercase tracking-wider text-sm [@media(max-height:500px)]:!text-[10px]">USERNAME THREADS</span>
          </label>
          <div className="relative mt-1 [@media(max-height:500px)]:!mt-0">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 [@media(max-height:500px)]:!pl-3 [@media(max-height:500px)]:!text-sm text-gray-400 font-bold">@</span>
            <input 
              type="text" 
              placeholder="zuck" 
              className="input input-lg w-full pl-10 [@media(max-height:500px)]:!pl-7 [@media(max-height:500px)]:!h-10 [@media(max-height:500px)]:!min-h-[2.5rem] [@media(max-height:500px)]:!text-sm input-glass transition-all shadow-inner focus:outline-none focus:ring-2 focus:ring-pink-400 font-medium" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
        </div>
        
        <div className="form-control [@media(max-height:500px)]:flex-[2]">
          <label className="label [@media(max-height:500px)]:!py-0 [@media(max-height:500px)]:!mb-1">
            <span className="label-text font-bold text-gray-200 uppercase tracking-wider text-sm [@media(max-height:500px)]:!text-[10px]">LỜI CHÚC</span>
          </label>
          <div className="mt-1 [@media(max-height:500px)]:!mt-0">
            <input 
              type="text"
              className="input input-lg w-full [@media(max-height:500px)]:!h-10 [@media(max-height:500px)]:!min-h-[2.5rem] [@media(max-height:500px)]:!text-sm input-glass transition-all shadow-inner focus:outline-none focus:ring-2 focus:ring-pink-400 font-medium" 
              placeholder="Nhập lời chúc của bạn..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>
        </div>
        
        <button 
          type="submit" 
          className={`btn btn-lg w-full [@media(max-height:500px)]:w-auto [@media(max-height:500px)]:!h-10 [@media(max-height:500px)]:!min-h-[2.5rem] [@media(max-height:500px)]:!mt-0 [@media(max-height:500px)]:!px-6 [@media(max-height:500px)]:!text-sm text-white bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 shadow-[0_4px_15px_rgba(0,0,0,0.2)] rounded-2xl mt-6 uppercase tracking-widest font-bold transition-all ${isSubmitting ? 'loading' : ''}`}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'ĐANG GỬI...' : 'GỬI'}
        </button>
      </form>
    </div>
  );
}
