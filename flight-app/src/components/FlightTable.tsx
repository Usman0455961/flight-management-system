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
import { Button } from '../../components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog"

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

// Add this interface for the modal state
interface StatusUpdateModal {
  isOpen: boolean;
  flightId: string;
  flightNumber: string;
  currentStatus: string;
  newStatus: string;
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
  const [statusModal, setStatusModal] = useState<StatusUpdateModal>({
    isOpen: false,
    flightId: '',
    flightNumber: '',
    currentStatus: '',
    newStatus: ''
  });

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
    console.log('Updating flight:', { flightId, newStatus });
    
    const currentFlight = flights.find(f => f._id === flightId);
    
    if (currentFlight && currentFlight.status !== newStatus) {
      try {
        await flightService.updateFlightStatus(currentFlight._id, newStatus);
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

  // Add function to handle edit button click
  const handleEditClick = (flight: Flight) => {
    console.log('Edit clicked for flight:', flight);
    setStatusModal({
      isOpen: true,
      flightId: flight._id,
      flightNumber: flight.flightNumber,
      currentStatus: flight.status,
      newStatus: flight.status
    });
  };

  // Update status update handler
  const handleStatusUpdate = async () => {
    try {
      await flightService.updateFlightStatus(statusModal.flightId, statusModal.newStatus);
      await fetchFlights();
      toast({
        title: "Status Updated",
        description: "Flight status has been updated successfully",
        className: "bg-green-500 text-white border-green-500 dark:bg-green-900 dark:border-green-900",
      });
      setStatusModal(prev => ({ ...prev, isOpen: false }));
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Failed to update flight status",
        className: "bg-red-500 text-white border-red-500 dark:bg-red-900 dark:border-red-900",
      });
      console.error('Error updating status:', error);
    }
  };

  // Add useEffect to monitor state changes
  useEffect(() => {
    console.log('Status modal state updated:', statusModal);
  }, [statusModal]);

  console.log('Rendering with statusModal:', statusModal);

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
            className="w-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
          />
        </div>
        <div>
          <Select
            value={selectedAirline}
            onValueChange={setSelectedAirline}
          >
            <SelectTrigger className="w-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <SelectValue placeholder="Filter by airline" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              {AIRLINE_OPTIONS.map((option) => (
                <SelectItem 
                  key={option.value} 
                  value={option.value}
                  className={`cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 ${
                    option.value === 'ALL' ? 'font-medium text-slate-900 dark:text-slate-100' : ''
                  }`}
                >
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
            <SelectTrigger className="w-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <SelectItem 
                value="ALL"
                className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 font-medium text-slate-900 dark:text-slate-100"
              >
                All Statuses
              </SelectItem>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem 
                  key={option.value} 
                  value={option.value}
                  className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700"
                >
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
              {canUpdateFlights && (
                <TableHead className="text-slate-700 dark:text-slate-300 text-left font-medium">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentFlights.map((flight) => (
              <TableRow 
                key={flight._id}
                className="border-t border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50"
              >
                <TableCell className="text-slate-900 dark:text-slate-300 py-4">{flight.flightNumber}</TableCell>
                <TableCell className="text-slate-900 dark:text-slate-300 py-4">
                  {formatDepartureTime(flight.scheduledDeparture)}
                </TableCell>
                <TableCell className="text-slate-900 dark:text-slate-300 py-4">{flight.destination}</TableCell>
                <TableCell className="text-slate-900 dark:text-slate-300 py-4">
                  <div className={`inline-flex px-2 py-1 rounded-full text-sm font-medium
                    ${flight.status === 'ON_TIME' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : ''}
                    ${flight.status === 'DELAYED' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : ''}
                    ${flight.status === 'CANCELLED' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : ''}
                  `}>
                    {STATUS_OPTIONS.find(opt => opt.value === flight.status)?.label || flight.status}
                  </div>
                </TableCell>
                {canUpdateFlights && (
                  <TableCell className="text-slate-900 dark:text-slate-300 py-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditClick(flight)}
                    >
                      Edit Status
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Status Update Modal */}
      <Dialog 
        open={statusModal.isOpen} 
        onOpenChange={(open: any) => {
          console.log('Dialog onOpenChange:', open);
          setStatusModal(prev => ({
            ...prev,
            isOpen: open
          }));
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update Flight Status</DialogTitle>
            <DialogDescription>
              Update the status for flight {statusModal.flightNumber}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Select
              value={statusModal.newStatus}
              onValueChange={(value) => {
                setStatusModal(prev => ({
                  ...prev,
                  newStatus: value
                }));
              }}
            >
              <SelectTrigger className="w-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                <SelectValue placeholder="Select new status" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem 
                    key={option.value} 
                    value={option.value}
                    className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setStatusModal(prev => ({
                  ...prev,
                  isOpen: false
                }));
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleStatusUpdate}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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