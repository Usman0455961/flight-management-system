'use client'

import { useEffect, useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select'
import { format } from 'date-fns'
import { websocketService } from '@/services/websocketService'
import { flightService, type Flight } from '@/services/flightService'
import { useToast } from '../../components/ui/use-toast'
import { Input } from '../../components/ui/input'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../../components/ui/pagination"

const STATUS_OPTIONS = [
  { value: "ON_TIME", label: "On Time" },
  { value: "DELAYED", label: "Delayed" },
  { value: "CANCELLED", label: "Cancelled" }
] as const;

const AIRLINE_OPTIONS = [
  { value: "ALL", label: "All Airlines" },
  { value: "AA", label: "American Airlines" },
  { value: "UA", label: "United Airlines" },
  { value: "DL", label: "Delta Airlines" },
  { value: "WN", label: "Southwest Airlines" }
] as const;

const formatDepartureTime = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return format(date, 'MMM dd, yyyy hh:mm a');
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

interface FlightTableProps {
  canUpdateFlights: boolean;
}

export function FlightTable({ canUpdateFlights }: FlightTableProps) {
  const { toast } = useToast()
  const [flights, setFlights] = useState<Flight[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState<{ [key: string]: string }>({})
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(5)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedAirline, setSelectedAirline] = useState('ALL')
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL')

  const fetchFlights = async () => {
    try {
      setIsLoading(true)
      const flightsData = await flightService.getFlights()
      setFlights(flightsData)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load flight data",
        className: "bg-red-500 text-white border-red-500 dark:bg-red-900 dark:border-red-900",
      })
      console.error('Error loading flights:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchFlights();

    const handleStatusUpdate = (message: any) => {
      if (message.type === 'STATUS_UPDATE') {
        fetchFlights();
      }
    };

    websocketService.addMessageHandler(handleStatusUpdate);

    return () => {
      websocketService.removeMessageHandler(handleStatusUpdate);
    };
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedAirline, selectedStatusFilter]);

  const handleStatusSelect = async (flightId: string, newStatus: string) => {
    const currentFlight = flights.find(f => f.id === flightId);
    
    if (currentFlight && currentFlight.status !== newStatus) {
      try {
        await flightService.updateFlightStatus(flightId, newStatus);
        await fetchFlights();
        toast({
          title: "Status Updated",
          description: "Flight status has been updated successfully",
          className: "bg-green-500 text-white border-green-500 dark:bg-green-900 dark:border-green-900",
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Update Failed",
          description: "Failed to update flight status",
          className: "bg-red-500 text-white border-red-500 dark:bg-red-900 dark:border-red-900",
        });
        console.error('Error updating status:', error);
        setSelectedStatus(prev => ({
          ...prev,
          [flightId]: currentFlight.status
        }));
      }
    }
  };

  const filteredFlights = flights.filter(flight => {
    const matchesSearch = 
      flight.flightNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flight.origin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flight.destination.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAirline = selectedAirline === 'ALL' || 
      flight.flightNumber.startsWith(selectedAirline);

    const matchesStatus = selectedStatusFilter === 'ALL' || 
      flight.status === selectedStatusFilter;

    return matchesSearch && matchesAirline && matchesStatus;
  });

  const indexOfLastFlight = currentPage * itemsPerPage;
  const indexOfFirstFlight = indexOfLastFlight - itemsPerPage;
  const currentFlights = filteredFlights.slice(indexOfFirstFlight, indexOfLastFlight);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const totalPages = Math.ceil(filteredFlights.length / itemsPerPage);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Input
            placeholder="Search flights..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <div>
          <Select
            value={selectedAirline}
            onValueChange={setSelectedAirline}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filter by airline" />
            </SelectTrigger>
            <SelectContent>
              {AIRLINE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Select
            value={selectedStatusFilter}
            onValueChange={setSelectedStatusFilter}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
              <TableHead className="text-slate-700 dark:text-slate-300 text-left font-medium">Flight Number</TableHead>
              <TableHead className="text-slate-700 dark:text-slate-300 text-left font-medium">Departure Time</TableHead>
              <TableHead className="text-slate-700 dark:text-slate-300 text-left font-medium">Destination</TableHead>
              <TableHead className="text-slate-700 dark:text-slate-300 text-left font-medium">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentFlights.map((flight) => (
              <TableRow 
                key={flight.id}
                className="border-t border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50"
              >
                <TableCell className="text-slate-900 dark:text-slate-300 py-4">{flight.flightNumber}</TableCell>
                <TableCell className="text-slate-900 dark:text-slate-300 py-4">
                  {formatDepartureTime(flight.scheduledDeparture)}
                </TableCell>
                <TableCell className="text-slate-900 dark:text-slate-300 py-4">{flight.destination}</TableCell>
                <TableCell className="text-slate-900 dark:text-slate-300 py-4">
                  {canUpdateFlights ? (
                    <Select
                      value={selectedStatus[flight.id] || flight.status}
                      onValueChange={(newStatus) => handleStatusSelect(flight.id, newStatus)}
                    >
                      <SelectTrigger className="w-[180px] bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                        <SelectValue>
                          {STATUS_OPTIONS.find(opt => 
                            opt.value === (selectedStatus[flight.id] || flight.status)
                          )?.label || "Select status"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((option) => (
                          <SelectItem 
                            key={`${flight.id}-${option.value}`} 
                            value={option.value}
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    STATUS_OPTIONS.find(opt => opt.value === flight.status)?.label || flight.status
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col items-center space-y-2">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
            
            <PaginationItem>
              <PaginationLink
                onClick={() => handlePageChange(1)}
                isActive={currentPage === 1}
              >
                1
              </PaginationLink>
            </PaginationItem>

            {currentPage > 3 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}

            {Array.from({ length: 3 }, (_, i) => currentPage - 1 + i)
              .filter(page => page > 1 && page < totalPages)
              .map(page => (
                <PaginationItem key={page}>
                  <PaginationLink
                    onClick={() => handlePageChange(page)}
                    isActive={currentPage === page}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}

            {currentPage < totalPages - 2 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}

            {totalPages > 1 && (
              <PaginationItem>
                <PaginationLink
                  onClick={() => handlePageChange(totalPages)}
                  isActive={currentPage === totalPages}
                >
                  {totalPages}
                </PaginationLink>
              </PaginationItem>
            )}

            <PaginationItem>
              <PaginationNext 
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>

        <div className="text-sm text-slate-500 dark:text-slate-400">
          Showing {indexOfFirstFlight + 1} to {Math.min(indexOfLastFlight, filteredFlights.length)} of {filteredFlights.length} flights
        </div>
      </div>
    </div>
  );
} 