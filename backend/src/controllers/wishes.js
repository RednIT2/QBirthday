import { supabase } from '../config/supabase.js';

export const getWishes = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('wishes')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching wishes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createWish = async (req, res) => {
  try {
    const { threads_username, content } = req.body;
    
    if (!threads_username || !content) {
      return res.status(400).json({ error: 'Username và nội dung lời chúc không được để trống' });
    }

    const { data, error } = await supabase
      .from('wishes')
      .insert([
        { threads_username, content, likes_count: 0 }
      ])
      .select();

    if (error) throw error;
    
    res.status(201).json(data[0]);
  } catch (error) {
    console.error('Error creating wish:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const likeWish = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Call RPC or fetch and increment. Since we might not have RPC, we'll fetch then update.
    // In a real production app, an RPC function to increment securely is better.
    const { data: wish, error: fetchError } = await supabase
      .from('wishes')
      .select('likes_count')
      .eq('id', id)
      .single();
      
    if (fetchError) throw fetchError;
    
    const { data, error } = await supabase
      .from('wishes')
      .update({ likes_count: (wish.likes_count || 0) + 1 })
      .eq('id', id)
      .select();
      
    if (error) throw error;
    
    res.json(data[0]);
  } catch (error) {
    console.error('Error liking wish:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
