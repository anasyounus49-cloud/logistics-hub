import { useState, useEffect, useCallback, useRef } from 'react';

export interface VehicleDetectionData {
  plate: string;           // Registration number
  vehicle: string;         // Vehicle type
  fastag: string;          // FASTag ID
  image: string;           // base64 encoded image
}

interface UseVehicleDetectionOptions {
  url?: string;
  autoConnect?: boolean;
  reconnectInterval?: number;
}

export function useVehicleDetection(options: UseVehicleDetectionOptions = {}) {
  const {
    url = 'ws://10.3.6.14:8001/ws',
    autoConnect = true,
    reconnectInterval = 3000,
  } = options;

  const [data, setData] = useState<VehicleDetectionData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const shouldReconnectRef = useRef(autoConnect);

  const connect = useCallback(() => {
    try {
      // Close existing connection if any
      if (socketRef.current) {
        socketRef.current.close();
      }

      const socket = new WebSocket(url);
      socketRef.current = socket;

      socket.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setError(null);
      };

      socket.onmessage = (event) => {
        try {
          const detectionData: VehicleDetectionData = JSON.parse(event.data);
          console.log('Vehicle detection received:', detectionData);
          setData(detectionData);
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
          setError('Failed to parse detection data');
        }
      };

      socket.onerror = (err) => {
        console.error('WebSocket error:', err);
        setError('WebSocket connection error');
      };

      socket.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        socketRef.current = null;

        // Attempt to reconnect if enabled
        if (shouldReconnectRef.current) {
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('Attempting to reconnect...');
            connect();
          }, reconnectInterval);
        }
      };
    } catch (err) {
      console.error('Error creating WebSocket:', err);
      setError('Failed to create WebSocket connection');
    }
  }, [url, reconnectInterval]);

  const disconnect = useCallback(() => {
    shouldReconnectRef.current = false;
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }

    setIsConnected(false);
  }, []);

  const reconnect = useCallback(() => {
    disconnect();
    shouldReconnectRef.current = true;
    connect();
  }, [connect, disconnect]);

  const clearData = useCallback(() => {
    setData(null);
  }, []);

  // Auto-connect on mount if enabled
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    // Cleanup on unmount
    return () => {
      shouldReconnectRef.current = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [autoConnect, connect]);

  return {
    data,
    isConnected,
    error,
    connect,
    disconnect,
    reconnect,
    clearData,
  };
}