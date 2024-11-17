import axiosInstance from './axiosConfig';

export interface Flight {
  id: string;
  flightNumber: string;
  origin: string;
  destination: string;
  scheduledDeparture: string;
  status: string;
}

export const flightService = {
  async getFlights(): Promise<Flight[]> {
    try {
      console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);
      console.log('Token:', localStorage.getItem('token'));
      
      const response = await axiosInstance.get('/flights');
      return response.data;
    } catch (error) {
      console.error('Error fetching flights:', error);
      throw error;
    }
  },

  async updateFlightStatus(flightId: string, status: string): Promise<Flight> {
    try {
      const response = await axiosInstance.patch(`/flights/${flightId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating flight status:', error);
      throw error;
    }
  }
}; 