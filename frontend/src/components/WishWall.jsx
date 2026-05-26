import React, { useState, useEffect, useRef, useCallback } from 'react';
import WishForm from './WishForm';
import { supabase } from '../lib/supabase';

// Helper: Format relative time
const getRelativeTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMinutes = Math.floor((now - date) / 60000);
  
  if (diffMinutes < 1) return 'Vừa xong';
  if (diffMinutes < 60) return `${diffMinutes} phút trước`;
  
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} giờ trước`;
  
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays} ngày trước`;
  
  return date.toLocaleDateString('vi-VN');
};

const PAGE_SIZE = 6;

export default function WishWall() {
  const [wishes, setWishes] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [likedIds, setLikedIds] = useState(new Set());

  const observer = useRef();

  // Countdown
  useEffect(() => {
    // Sửa định dạng ngày tháng sang dạng chuẩn ISO để đảm bảo tương thích mọi trình duyệt
    const targetDate = new Date('2026-05-30T00:00:00+07:00').getTime();
    
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        return false;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
      return true;
    };

    // Chạy tính toán ngay lập tức khi load để không bị hiển thị 00 ở giây đầu tiên
    calculateTimeLeft();

    const interval = setInterval(() => {
      if (!calculateTimeLeft()) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Fetch initial data from Supabase
  useEffect(() => {
    const fetchInitialWishes = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('wishes')
        .select('*')
        .order('created_at', { ascending: false })
        .range(0, PAGE_SIZE - 1);

      if (error) {
        console.error("Lỗi tải dữ liệu Supabase:", error);
        // Có thể chưa cấu hình Supabase, bỏ trống danh sách thay vì báo lỗi liên tục
        setHasMore(false);
      } else if (data) {
        setWishes(data);
        if (data.length < PAGE_SIZE) setHasMore(false);
        setPage(1);
      }
      setLoading(false);
    };

    fetchInitialWishes();
  }, []);

  const lastWishElementRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !searchQuery) { 
        loadMoreWishes();
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loading, hasMore, page, wishes, searchQuery]);

  const loadMoreWishes = async () => {
    setLoading(true);
    
    const { data, error } = await supabase
      .from('wishes')
      .select('*')
      .order('created_at', { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (error) {
      console.error(error);
      setHasMore(false);
    } else if (data) {
      if (data.length === 0) {
        setHasMore(false);
      } else {
        setWishes(prev => [...prev, ...data]);
        setPage(prev => prev + 1);
        if (data.length < PAGE_SIZE) setHasMore(false);
      }
    }
    setLoading(false);
  };

  const handleAddWish = (newWish) => {
    setWishes([newWish, ...wishes]);
    document.getElementById('wall-section').scrollIntoView({ behavior: 'smooth' });
  };

  const handleLike = async (id, currentLikes) => {
    const isLiked = likedIds.has(id);
    if (isLiked) return; // Chỉ cho phép like 1 lần theo yêu cầu

    const newLikedIds = new Set(likedIds);
    newLikedIds.add(id);
    setLikedIds(newLikedIds);

    // Cập nhật giao diện lập tức (Optimistic Update)
    setWishes(wishes.map(wish => {
      if (wish.id === id) {
        return { ...wish, likes_count: wish.likes_count + 1 };
      }
      return wish;
    }));

    // Cập nhật DB
    const { error } = await supabase
      .from('wishes')
      .update({ likes_count: currentLikes + 1 })
      .eq('id', id);

    if (error) {
      console.error("Lỗi khi like:", error);
    }
  };

  const filteredWishes = wishes.filter(wish => 
    wish.threads_username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full text-white">
      {/* SECTION 1: HEADER (HERO) */}
      <section className="min-h-[100dvh] w-full flex flex-col items-center justify-end pb-16 md:pb-32 [@media(max-height:500px)]:!pb-2 relative overflow-hidden">
        <div className="z-10 text-center px-4 transform transition-all duration-1000 w-full max-w-3xl mx-auto">
          <div className="flex flex-col items-center justify-center gap-6 [@media(max-height:500px)]:!gap-2">
            <p className="text-lg md:text-2xl [@media(max-height:500px)]:!text-sm text-white font-bold uppercase tracking-[0.3em] drop-shadow-lg liquid-glass px-8 py-2 [@media(max-height:500px)]:!py-1.5 [@media(max-height:500px)]:!px-6 rounded-full shrink-0">
              30.05.2026
            </p>
            
            <div className="flex justify-between items-center gap-1 sm:gap-2 md:gap-6 liquid-glass p-4 sm:p-6 md:p-10 [@media(max-height:500px)]:!py-2 [@media(max-height:500px)]:!px-8 w-[95%] sm:w-full [@media(max-height:500px)]:!max-w-md mx-auto">
              <div className="flex flex-col items-center flex-1">
                <span className="text-2xl sm:text-4xl md:text-6xl [@media(max-height:500px)]:!text-lg font-bold text-white drop-shadow-md">{String(timeLeft.days).padStart(2, '0')}</span>
                <span className="text-[9px] sm:text-[10px] md:text-sm [@media(max-height:500px)]:!text-[8px] uppercase tracking-widest text-white/80 font-bold mt-1 md:mt-2 [@media(max-height:500px)]:!mt-0">Ngày</span>
              </div>
              <div className="text-xl sm:text-3xl md:text-5xl [@media(max-height:500px)]:!text-lg font-light text-white/50 -translate-y-2 md:-translate-y-3 [@media(max-height:500px)]:!-translate-y-0.5">:</div>
              <div className="flex flex-col items-center flex-1">
                <span className="text-2xl sm:text-4xl md:text-6xl [@media(max-height:500px)]:!text-lg font-bold text-white drop-shadow-md">{String(timeLeft.hours).padStart(2, '0')}</span>
                <span className="text-[9px] sm:text-[10px] md:text-sm [@media(max-height:500px)]:!text-[8px] uppercase tracking-widest text-white/80 font-bold mt-1 md:mt-2 [@media(max-height:500px)]:!mt-0">Giờ</span>
              </div>
              <div className="text-xl sm:text-3xl md:text-5xl [@media(max-height:500px)]:!text-lg font-light text-white/50 -translate-y-2 md:-translate-y-3 [@media(max-height:500px)]:!-translate-y-0.5">:</div>
              <div className="flex flex-col items-center flex-1">
                <span className="text-2xl sm:text-4xl md:text-6xl [@media(max-height:500px)]:!text-lg font-bold text-white drop-shadow-md">{String(timeLeft.minutes).padStart(2, '0')}</span>
                <span className="text-[9px] sm:text-[10px] md:text-sm [@media(max-height:500px)]:!text-[8px] uppercase tracking-widest text-white/80 font-bold mt-1 md:mt-2 [@media(max-height:500px)]:!mt-0">Phút</span>
              </div>
              <div className="text-xl sm:text-3xl md:text-5xl [@media(max-height:500px)]:!text-lg font-light text-white/50 -translate-y-2 md:-translate-y-3 [@media(max-height:500px)]:!-translate-y-0.5">:</div>
              <div className="flex flex-col items-center flex-1">
                <span className="text-2xl sm:text-4xl md:text-6xl [@media(max-height:500px)]:!text-lg font-bold text-white drop-shadow-md">{String(timeLeft.seconds).padStart(2, '0')}</span>
                <span className="text-[9px] sm:text-[10px] md:text-sm [@media(max-height:500px)]:!text-[8px] uppercase tracking-widest text-white/80 font-bold mt-1 md:mt-2 [@media(max-height:500px)]:!mt-0">Giây</span>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-4 md:bottom-8 [@media(max-height:500px)]:hidden animate-bounce cursor-pointer opacity-70 hover:opacity-100 transition-opacity" onClick={() => document.getElementById('form-section').scrollIntoView({ behavior: 'smooth' })}>
          <svg className="w-8 h-8 md:w-10 md:h-10 mx-auto text-white drop-shadow-lg" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>
        </div>
      </section>

      {/* SECTION 2: FORM */}
      <section id="form-section" className="min-h-[100dvh] w-full flex items-center justify-center [@media(max-height:500px)]:items-end [@media(max-height:500px)]:pb-2 px-4 relative">
        <WishForm onAddWish={handleAddWish} />
      </section>

      {/* SECTION 3: WISH WALL */}
      <section id="wall-section" className="min-h-[100dvh] w-full flex flex-col justify-start px-2 sm:px-4 md:px-8 py-10 [@media(max-height:500px)]:!py-4 relative">
        <div className="max-w-6xl w-[95%] md:w-full mx-auto flex flex-col liquid-glass p-4 sm:p-6 md:p-10 [@media(max-height:500px)]:!p-4 mb-20">
          <div className="flex flex-col md:flex-row [@media(max-height:500px)]:!flex-row justify-between items-center mb-6 md:mb-8 [@media(max-height:500px)]:!mb-3 gap-4 shrink-0">
            <h2 className="text-xl sm:text-2xl md:text-4xl [@media(max-height:500px)]:!text-base font-extrabold text-white drop-shadow-md uppercase tracking-widest text-center">
              LỜI CHÚC TỪ MỌI NGƯỜI
            </h2>
            <div className="relative w-full md:w-72 [@media(max-height:500px)]:w-48">
              <input 
                type="text" 
                placeholder="Tìm username..." 
                className="input [@media(max-height:500px)]:!h-8 [@media(max-height:500px)]:!min-h-[2rem] [@media(max-height:500px)]:!text-xs w-full rounded-full input-glass transition-colors pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <svg className="w-5 h-5 absolute left-3 top-3 [@media(max-height:500px)]:top-1.5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
          </div>
          
          <div className="w-full mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 [@media(max-height:500px)]:grid-cols-2 lg:grid-cols-3 gap-6 [@media(max-height:500px)]:gap-4 pb-4">
              {filteredWishes.map((wish, index) => {
                const isLastElement = filteredWishes.length === index + 1;
                const isLiked = likedIds.has(wish.id);
                
                return (
                  <div 
                    ref={isLastElement ? lastWishElementRef : null}
                    key={wish.id}
                    className="liquid-glass !bg-white/10 !border-white/10 p-5 md:p-6 [@media(max-height:500px)]:!p-3 hover:-translate-y-1 transition-all duration-300 hover:shadow-2xl hover:!bg-white/20"
                  >
                    <div className="flex items-center gap-2 mb-3 [@media(max-height:500px)]:!mb-1">
                      <div className="flex-1 min-w-0">
                        <a 
                          href={`https://www.threads.net/@${wish.threads_username}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="font-bold text-white text-lg hover:text-pink-300 transition-colors truncate block drop-shadow-sm"
                        >
                          @{wish.threads_username}
                        </a>
                      </div>
                      <span className="text-xs text-gray-300 font-semibold uppercase shrink-0">
                        {getRelativeTime(wish.created_at)}
                      </span>
                    </div>
                    
                    <p className="text-gray-100 whitespace-pre-wrap mb-5 [@media(max-height:500px)]:!mb-2 text-[15px] [@media(max-height:500px)]:!text-[12px] leading-relaxed font-medium line-clamp-3">
                      {wish.content}
                    </p>
                    
                    <div className="flex justify-end items-center pt-3 [@media(max-height:500px)]:!pt-1 border-t border-white/10">
                      <button 
                        onClick={() => handleLike(wish.id, wish.likes_count)}
                        className={`btn btn-sm btn-ghost gap-2 rounded-full transition-all duration-300 ${isLiked ? 'text-pink-400 bg-white/10 pointer-events-none' : 'text-gray-300 hover:text-pink-300 hover:bg-white/10'}`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 drop-shadow-md ${isLiked ? "fill-current scale-110" : "none"}`} fill={isLiked ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <span className="font-bold text-sm">{wish.likes_count}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
              
              {filteredWishes.length === 0 && !loading && (
                <div className="col-span-full text-center text-gray-300 py-10 font-medium">
                  Chưa có lời chúc nào hoặc chưa kết nối cơ sở dữ liệu.
                </div>
              )}
            </div>

            {loading && !searchQuery && (
              <div className="py-6 text-center flex justify-center">
                <span className="loading loading-dots loading-md text-white"></span>
              </div>
            )}
            {!hasMore && !searchQuery && filteredWishes.length > 0 && (
              <div className="py-6 text-center text-gray-400 text-sm font-bold uppercase tracking-widest">
                ĐÃ XEM HẾT
              </div>
            )}
          </div>
        </div>
      </section>
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.4);
        }
      `}} />
    </div>
  );
}
