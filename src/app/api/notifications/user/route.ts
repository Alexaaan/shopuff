import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { UserNotification } from '@/types/notifications';

// GET /api/notifications/user - Get user notifications
export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabase();
    const { searchParams } = new URL(request.url);
    
    const userId = searchParams.get('userId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const offset = (page - 1) * limit;

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    let query = supabase
      .from('user_notifications')
      .select('*')
      .eq('user_id', parseInt(userId))
      .order('created_at', { ascending: false });

    if (unreadOnly) {
      query = query.eq('is_read', false);
    }

    const { data, error, count } = await query.range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching notifications:', error);
      return NextResponse.json({ error: 'Erreur récupération notifications' }, { status: 500 });
    }

    // Get unread count
    const { count: unreadCount } = await supabase
      .from('user_notifications')
      .select('id', { count: 'exact' })
      .eq('user_id', parseInt(userId))
      .eq('is_read', false);

    return NextResponse.json({
      notifications: data as UserNotification[],
      unreadCount: unreadCount || 0,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Error in notifications GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/notifications/user - Create notification
export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabase();
    const body = await request.json();
    
    const { userId, type, title, message, data, actionUrl } = body;

    if (!userId || !type || !title || !message) {
      return NextResponse.json({ error: 'Données invalides' }, { status: 400 });
    }

    const { data: notification, error } = await supabase
      .from('user_notifications')
      .insert({
        user_id: userId,
        type,
        title,
        message,
        data: data || {},
        action_url: actionUrl || null
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating notification:', error);
      return NextResponse.json({ error: 'Erreur création notification' }, { status: 500 });
    }

    // Send WebSocket event for real-time update
    if (typeof global !== 'undefined' && (global as any).wsClients) {
      const wsEvent = {
        type: 'new_notification',
        notification: notification
      };
      (global as any).wsClients.forEach((client: any) => {
        if (client.userId === userId && client.readyState === 1) {
          client.send(JSON.stringify(wsEvent));
        }
      });
    }

    return NextResponse.json({ 
      success: true, 
      notification: notification as UserNotification 
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/notifications/user - Mark as read
export async function PUT(request: NextRequest) {
  try {
    const supabase = await getSupabase();
    const body = await request.json();
    
    const { notificationId, userId, markAllAsRead } = body;

    if (markAllAsRead && userId) {
      // Mark all notifications as read for user
      const { error } = await supabase
        .from('user_notifications')
        .update({ 
          is_read: true, 
          read_at: new Date().toISOString() 
        })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) {
        console.error('Error marking all as read:', error);
        return NextResponse.json({ error: 'Erreur mise à jour' }, { status: 500 });
      }

      return NextResponse.json({ success: true, updated: 'all' });
    }

    if (notificationId && userId) {
      // Mark single notification as read
      const { error } = await supabase
        .from('user_notifications')
        .update({ 
          is_read: true, 
          read_at: new Date().toISOString() 
        })
        .eq('id', notificationId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error marking as read:', error);
        return NextResponse.json({ error: 'Erreur mise à jour' }, { status: 500 });
      }

      return NextResponse.json({ success: true, updated: 'single' });
    }

    return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 });
  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/notifications/user - Delete notification
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await getSupabase();
    const { searchParams } = new URL(request.url);
    
    const notificationId = searchParams.get('id');
    const userId = parseInt(searchParams.get('userId') || '0');

    if (!notificationId || !userId) {
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 });
    }

    const { error } = await supabase
      .from('user_notifications')
      .delete()
      .eq('id', parseInt(notificationId))
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting notification:', error);
      return NextResponse.json({ error: 'Erreur suppression' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting notification:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
