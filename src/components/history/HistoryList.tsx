
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ArrowUpDown, Filter, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';

// Mock data for demonstration
const mockHistory = [
  {
    id: 'analysis-123456',
    date: '2023-09-15T14:30:00Z',
    patientId: 'P-9876',
    tumorType: 'Glioma',
    confidence: 97.8,
    doctor: 'Dr. Sarah Johnson',
  },
  {
    id: 'analysis-123457',
    date: '2023-09-14T09:15:00Z',
    patientId: 'P-9877',
    tumorType: 'Meningioma',
    confidence: 95.3,
    doctor: 'Dr. Mark Williams',
  },
  {
    id: 'analysis-123458',
    date: '2023-09-13T16:45:00Z',
    patientId: 'P-9878',
    tumorType: 'Pituitary',
    confidence: 96.1,
    doctor: 'Dr. Sarah Johnson',
  },
  {
    id: 'analysis-123459',
    date: '2023-09-12T11:20:00Z',
    patientId: 'P-9879',
    tumorType: 'Glioma',
    confidence: 92.5,
    doctor: 'Dr. James Parker',
  },
  {
    id: 'analysis-123460',
    date: '2023-09-11T13:10:00Z',
    patientId: 'P-9880',
    tumorType: 'Meningioma',
    confidence: 98.2,
    doctor: 'Dr. Mark Williams',
  },
];

const HistoryList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortByDate, setSortByDate] = useState<'asc' | 'desc'>('desc');
  
  // Filter and sort the data
  const filteredData = mockHistory
    .filter(item => 
      item.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tumorType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.doctor.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortByDate === 'asc' ? dateA - dateB : dateB - dateA;
    });

  // Set confidence color based on value
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 95) return 'bg-green-100 text-green-800';
    if (confidence >= 85) return 'bg-amber-100 text-amber-800';
    return 'bg-red-100 text-red-800';
  };

  // Set tumor type badge color
  const getTumorTypeBadge = (type: string) => {
    switch (type.toLowerCase()) {
      case 'glioma':
        return 'bg-blue-100 text-blue-800';
      case 'meningioma':
        return 'bg-purple-100 text-purple-800';
      case 'pituitary':
        return 'bg-teal-100 text-teal-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by patient ID, tumor type, or doctor..."
            className="pl-9 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setSortByDate(sortByDate === 'asc' ? 'desc' : 'asc')}
            className="flex items-center"
          >
            <ArrowUpDown className="mr-1 h-4 w-4" />
            <span>Date {sortByDate === 'asc' ? '↑' : '↓'}</span>
          </Button>
          
          <Button variant="outline" size="sm" className="flex items-center">
            <Filter className="mr-1 h-4 w-4" />
            <span>Filter</span>
          </Button>
        </div>
      </div>

      <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Patient ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Tumor Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Confidence
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Doctor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredData.length > 0 ? (
                filteredData.map((item, index) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {new Date(item.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {item.patientId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTumorTypeBadge(item.tumorType)}`}>
                        {item.tumorType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(item.confidence)}`}>
                        {item.confidence}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {item.doctor}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          asChild
                        >
                          <Link to="/dashboard">
                            <span className="sr-only">View</span>
                            <Download className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    No results found for "{searchTerm}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HistoryList;
