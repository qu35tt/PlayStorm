import { useEffect } from 'react';
import { useSocket } from '../context/socket-context';
import { useUser } from '../context/user-context'; // Assuming you have this context
import { useParams } from 'react-router';

export const TestJoinComponent = () => {
  const socket = useSocket();
  const { userCredentials } = useUser();
  const { roomId } = useParams<{ roomId: string }>(); // Gets 'my-test-room' from URL

  useEffect(() => {
    // 1. Only run if we have a user and room
    if (!userCredentials || !roomId) {
      console.warn('Waiting for user or roomId...');
      return;
    }

    console.log(`Attempting to join room: ${roomId} as ${userCredentials.username}`);

    // 2. Define event listeners BEFORE connecting
    socket.on('connect', () => {
      console.log(`Socket connected with ID: ${socket.id}`);
      
      // 3. Now that we are connected, emit the join event
      socket.emit('join', {
        roomId: roomId,
        videoId: 'default-video-id', // Use a test video ID
        user: userCredentials,
      });
      console.log('Emitted "join" event.');
    });

    socket.on('disconnect', (reason) => {
      console.log(`Socket disconnected: ${reason}`);
    });

    // 4. THIS IS THE SUCCESS CRITERIA
    socket.on('initpartystate', (state) => {
      console.log('✅✅✅ JOIN SUCCESSFUL ✅✅✅');
      console.log('Received "initpartystate":', state);
    });

    // 5. Connect the socket
    socket.connect();

    // 6. Cleanup function on component unmount
    return () => {
      console.log('Cleaning up socket...');
      socket.off('connect');
      socket.off('disconnect');
      socket.off('initpartystate');
      socket.disconnect();
    };
  }, [socket, userCredentials, roomId]); // Re-run if these change

  return (
    <div>
      <h2>Testing Socket Join...</h2>
      <p>Room ID: {roomId}</p>
      <p>User: {userCredentials?.username || 'Loading...'}</p>
      <p>Check the console for logs.</p>
    </div>
  );
};