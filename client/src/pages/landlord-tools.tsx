import { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { Redirect } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Wrench, 
  BellRing, 
  Upload, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  FileArchive,
  BarChart3,
  TrendingUp,
  EyeOff,
  FilePlus,
  CalendarCheck,
  CircleDollarSign,
  Search,
  EyeIcon
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

// Sample data for demo purposes
const applicants = [
  { 
    id: 1, 
    name: 'Alex Johnson', 
    email: 'alex@example.com', 
    status: 'pending',
    creditScore: 710,
    income: '$2,800/month',
    occupation: 'Student (Graduate)',
    references: 2,
    applicationDate: '2023-09-15',
    property: 'Cozy Student Suite near McMaster University'
  },
  { 
    id: 2, 
    name: 'Morgan Smith', 
    email: 'morgan@example.com', 
    status: 'approved',
    creditScore: 745,
    income: '$3,200/month',
    occupation: 'Research Assistant',
    references: 3,
    applicationDate: '2023-09-10',
    property: 'Modern Apartment in Westdale'
  },
  { 
    id: 3, 
    name: 'Jordan Williams', 
    email: 'jordan@example.com', 
    status: 'rejected',
    creditScore: 620,
    income: '$1,900/month',
    occupation: 'Part-time Retail',
    references: 1,
    applicationDate: '2023-09-05',
    property: 'Budget-Friendly Studio in Hamilton'
  },
];

const maintenanceRequests = [
  {
    id: 1,
    property: 'Cozy Student Suite near McMaster University',
    tenant: 'Taylor Reed',
    issue: 'Leaky faucet in bathroom',
    priority: 'medium',
    status: 'pending',
    dateSubmitted: '2023-09-20',
    images: ['https://images.unsplash.com/photo-1575336997269-a0696738211a?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'],
  },
  {
    id: 2,
    property: 'Modern Apartment in Westdale',
    tenant: 'Morgan Smith',
    issue: 'Heating not working properly',
    priority: 'high',
    status: 'in-progress',
    dateSubmitted: '2023-09-18',
    assignedTo: 'ServicePlus Heating',
    scheduledDate: '2023-09-25',
    images: [],
  },
  {
    id: 3,
    property: 'Spacious 2BR with Campus View',
    tenant: 'Jamie Allen',
    issue: 'Light fixture not working in kitchen',
    priority: 'low',
    status: 'completed',
    dateSubmitted: '2023-09-10',
    completedDate: '2023-09-15',
    images: ['https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'],
  },
];

const payments = [
  {
    id: 1,
    tenant: 'Morgan Smith',
    property: 'Modern Apartment in Westdale',
    amount: 1200,
    dueDate: '2023-10-01',
    status: 'paid',
    paymentDate: '2023-09-28',
    paymentMethod: 'Bank Transfer',
  },
  {
    id: 2,
    tenant: 'Taylor Reed',
    property: 'Cozy Student Suite near McMaster University',
    amount: 950,
    dueDate: '2023-10-01',
    status: 'pending',
    paymentMethod: 'Pending',
  },
  {
    id: 3,
    tenant: 'Jamie Allen',
    property: 'Spacious 2BR with Campus View',
    amount: 1450,
    dueDate: '2023-10-01',
    status: 'late',
    paymentMethod: 'Pending',
    daysPastDue: 5,
  },
];

// Component for tenant screening
const TenantScreening = () => {
  const { toast } = useToast();
  const [selectedApplicant, setSelectedApplicant] = useState<number | null>(null);
  
  const handleStatusChange = (id: number, newStatus: string) => {
    toast({
      title: `Applicant status updated`,
      description: `Status changed to ${newStatus}`,
    });
    
    // In a real app, you would update the database here
    setSelectedApplicant(null);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Tenant Applications</h2>
          <p className="text-muted-foreground">Screen and manage tenant applications</p>
        </div>
        <Button>
          <FilePlus className="mr-2 h-4 w-4" />
          Create Application Form
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-5 space-y-4">
          {applicants.map((applicant) => (
            <motion.div 
              key={applicant.id}
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
            >
              <Card className={`cursor-pointer ${selectedApplicant === applicant.id ? 'border-primary' : ''}`}
                    onClick={() => setSelectedApplicant(applicant.id)}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h3 className="font-medium">{applicant.name}</h3>
                      <p className="text-sm text-muted-foreground">{applicant.email}</p>
                      <p className="text-xs text-muted-foreground">Applied: {applicant.applicationDate}</p>
                    </div>
                    <Badge variant={
                      applicant.status === 'approved' ? 'success' :
                      applicant.status === 'rejected' ? 'destructive' : 'outline'
                    }>
                      {applicant.status === 'pending' ? 'Pending Review' :
                       applicant.status === 'approved' ? 'Approved' : 'Denied'}
                    </Badge>
                  </div>
                  <div className="mt-3">
                    <p className="text-sm truncate">{applicant.property}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
        
        <div className="md:col-span-7">
          {selectedApplicant ? (
            <Card>
              <CardHeader>
                <CardTitle>Application Review</CardTitle>
                <CardDescription>
                  {applicants.find(a => a.id === selectedApplicant)?.property}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Applicant details */}
                <div className="space-y-2">
                  <h3 className="font-medium">Applicant Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Name</Label>
                      <p>{applicants.find(a => a.id === selectedApplicant)?.name}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Email</Label>
                      <p>{applicants.find(a => a.id === selectedApplicant)?.email}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Occupation</Label>
                      <p>{applicants.find(a => a.id === selectedApplicant)?.occupation}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Income</Label>
                      <p>{applicants.find(a => a.id === selectedApplicant)?.income}</p>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                {/* Credit Score */}
                <div>
                  <h3 className="font-medium mb-2">Credit Score</h3>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Poor</span>
                      <span className="font-medium">
                        {applicants.find(a => a.id === selectedApplicant)?.creditScore}
                      </span>
                      <span>Excellent</span>
                    </div>
                    <Progress 
                      value={(applicants.find(a => a.id === selectedApplicant)?.creditScore || 0) / 8.5} 
                      className="h-2"
                      indicatorClassName={
                        (applicants.find(a => a.id === selectedApplicant)?.creditScore || 0) > 700 
                          ? 'bg-green-500' 
                          : (applicants.find(a => a.id === selectedApplicant)?.creditScore || 0) > 650
                            ? 'bg-amber-500'
                            : 'bg-red-500'
                      }
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>350</span>
                      <span>850</span>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                {/* Background check */}
                <div className="space-y-2">
                  <h3 className="font-medium">Background Check</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 bg-green-50 rounded-lg flex items-center">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                      <div>
                        <p className="text-sm font-medium">No Criminal Records</p>
                        <p className="text-xs text-muted-foreground">Last checked: Yesterday</p>
                      </div>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg flex items-center">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                      <div>
                        <p className="text-sm font-medium">ID Verified</p>
                        <p className="text-xs text-muted-foreground">Government ID matched</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                {/* References */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">References</h3>
                    <Button variant="link" size="sm" className="p-0 h-auto">
                      View all
                    </Button>
                  </div>
                  <div className="border rounded-lg p-3">
                    <div className="flex justify-between">
                      <div>
                        <p className="text-sm font-medium">Previous Landlord</p>
                        <p className="text-xs text-muted-foreground">Sarah Thompson - Golden Properties</p>
                      </div>
                      <Badge variant="outline">Positive</Badge>
                    </div>
                    <p className="text-sm mt-2 text-muted-foreground">
                      "Always paid rent on time and kept the apartment in good condition."
                    </p>
                  </div>
                </div>
                
                <Separator />
                
                {/* Document verification */}
                <div className="space-y-2">
                  <h3 className="font-medium">Documents</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border rounded-lg p-3 flex items-center">
                      <FileText className="h-5 w-5 text-blue-500 mr-2" />
                      <div className="flex-1">
                        <p className="text-sm">Income_Verification.pdf</p>
                        <p className="text-xs text-muted-foreground">Uploaded on Sep 15</p>
                      </div>
                      <Button variant="ghost" size="icon">
                        <EyeIcon className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="border rounded-lg p-3 flex items-center">
                      <FileText className="h-5 w-5 text-blue-500 mr-2" />
                      <div className="flex-1">
                        <p className="text-sm">McMaster_Student_ID.jpg</p>
                        <p className="text-xs text-muted-foreground">Uploaded on Sep 15</p>
                      </div>
                      <Button variant="ghost" size="icon">
                        <EyeIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setSelectedApplicant(null)}>
                  Back to List
                </Button>
                <div className="space-x-2">
                  <Button 
                    variant="destructive" 
                    onClick={() => handleStatusChange(selectedApplicant, 'rejected')}
                    disabled={applicants.find(a => a.id === selectedApplicant)?.status === 'rejected'}
                  >
                    Deny
                  </Button>
                  <Button 
                    onClick={() => handleStatusChange(selectedApplicant, 'approved')}
                    disabled={applicants.find(a => a.id === selectedApplicant)?.status === 'approved'}
                  >
                    Approve
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="py-12 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Search className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-medium mb-2">Select an Applicant</h3>
                <p className="text-muted-foreground max-w-md">
                  Choose an applicant from the list to view their details and make screening decisions.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

// Component for maintenance management
const MaintenanceManagement = () => {
  const { toast } = useToast();
  const [selectedRequest, setSelectedRequest] = useState<number | null>(null);
  
  const handleStatusChange = (id: number, newStatus: string) => {
    toast({
      title: `Maintenance request updated`,
      description: `Status changed to ${newStatus}`,
    });
    
    // In a real app, you would update the database here
    setSelectedRequest(null);
  };
  
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">High</Badge>;
      case 'medium':
        return <Badge variant="warning">Medium</Badge>;
      default:
        return <Badge variant="outline">Low</Badge>;
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="success">Completed</Badge>;
      case 'in-progress':
        return <Badge variant="warning">In Progress</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Maintenance Requests</h2>
          <p className="text-muted-foreground">Track and manage property maintenance issues</p>
        </div>
        <Button>
          <Wrench className="mr-2 h-4 w-4" />
          Add New Request
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-5 space-y-4">
          {maintenanceRequests.map((request) => (
            <motion.div 
              key={request.id}
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
            >
              <Card className={`cursor-pointer ${selectedRequest === request.id ? 'border-primary' : ''}`}
                    onClick={() => setSelectedRequest(request.id)}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h3 className="font-medium">{request.issue}</h3>
                      <p className="text-sm text-muted-foreground">{request.tenant}</p>
                      <p className="text-xs text-muted-foreground">Submitted: {request.dateSubmitted}</p>
                    </div>
                    <div className="space-y-2 text-right">
                      {getPriorityBadge(request.priority)}
                      <div>
                        {getStatusBadge(request.status)}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-sm truncate">{request.property}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
        
        <div className="md:col-span-7">
          {selectedRequest ? (
            <Card>
              <CardHeader>
                <CardTitle>Maintenance Request Details</CardTitle>
                <CardDescription>
                  {maintenanceRequests.find(r => r.id === selectedRequest)?.property}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Request details */}
                <div className="space-y-2">
                  <h3 className="font-medium">Issue Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Issue Type</Label>
                      <p>{maintenanceRequests.find(r => r.id === selectedRequest)?.issue}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Reported By</Label>
                      <p>{maintenanceRequests.find(r => r.id === selectedRequest)?.tenant}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Date Submitted</Label>
                      <p>{maintenanceRequests.find(r => r.id === selectedRequest)?.dateSubmitted}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Priority</Label>
                      <p className="capitalize">{maintenanceRequests.find(r => r.id === selectedRequest)?.priority}</p>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                {/* Status tracking */}
                <div className="space-y-3">
                  <h3 className="font-medium">Status Updates</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Request Received</p>
                        <p className="text-xs text-muted-foreground">
                          {maintenanceRequests.find(r => r.id === selectedRequest)?.dateSubmitted}
                        </p>
                      </div>
                    </div>
                    
                    {maintenanceRequests.find(r => r.id === selectedRequest)?.status === 'in-progress' && (
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center mr-3">
                          <Clock className="h-4 w-4 text-amber-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Work In Progress</p>
                          <p className="text-xs text-muted-foreground">
                            Assigned to: {maintenanceRequests.find(r => r.id === selectedRequest)?.assignedTo}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {maintenanceRequests.find(r => r.id === selectedRequest)?.status === 'completed' && (
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Work Completed</p>
                          <p className="text-xs text-muted-foreground">
                            {maintenanceRequests.find(r => r.id === selectedRequest)?.completedDate}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <Separator />
                
                {/* Photos/evidence */}
                {maintenanceRequests.find(r => r.id === selectedRequest)?.images.length ? (
                  <div className="space-y-2">
                    <h3 className="font-medium">Photos</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {maintenanceRequests.find(r => r.id === selectedRequest)?.images.map((image, index) => (
                        <div key={index} className="rounded-md overflow-hidden relative h-32">
                          <img 
                            src={image} 
                            alt={`Issue ${index + 1}`} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
                
                {/* Action form */}
                {maintenanceRequests.find(r => r.id === selectedRequest)?.status !== 'completed' && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <h3 className="font-medium">Take Action</h3>
                      
                      {maintenanceRequests.find(r => r.id === selectedRequest)?.status === 'pending' ? (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="assigned-to">Assign To</Label>
                              <Select>
                                <SelectTrigger id="assigned-to">
                                  <SelectValue placeholder="Select contractor" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="internal">Internal Maintenance</SelectItem>
                                  <SelectItem value="plumbing">Hamilton Plumbing Co.</SelectItem>
                                  <SelectItem value="electrical">ElectraTech Services</SelectItem>
                                  <SelectItem value="hvac">ServicePlus Heating</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="schedule-date">Schedule Date</Label>
                              <Input type="date" id="schedule-date" />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="notes">Notes for Contractor</Label>
                            <Textarea id="notes" placeholder="Add any special instructions or access details..." />
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setSelectedRequest(null)}>
                  Back to List
                </Button>
                <div className="space-x-2">
                  {maintenanceRequests.find(r => r.id === selectedRequest)?.status === 'pending' && (
                    <Button onClick={() => handleStatusChange(selectedRequest, 'in-progress')}>
                      Schedule Work
                    </Button>
                  )}
                  
                  {maintenanceRequests.find(r => r.id === selectedRequest)?.status === 'in-progress' && (
                    <Button onClick={() => handleStatusChange(selectedRequest, 'completed')}>
                      Mark Completed
                    </Button>
                  )}
                  
                  {maintenanceRequests.find(r => r.id === selectedRequest)?.status === 'completed' && (
                    <Button variant="outline" onClick={() => setSelectedRequest(null)}>
                      Close
                    </Button>
                  )}
                </div>
              </CardFooter>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="py-12 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Wrench className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-medium mb-2">Select a Maintenance Request</h3>
                <p className="text-muted-foreground max-w-md">
                  Choose a request from the list to view details and manage the repair process.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

// Component for lease generation and management
const LeaseManagement = () => {
  const { toast } = useToast();
  const [documentName, setDocumentName] = useState<string>('');
  const [templateType, setTemplateType] = useState<string>('standard');
  
  const handleCreateDocument = () => {
    if (!documentName) {
      toast({
        title: 'Error',
        description: 'Please provide a document name',
        variant: 'destructive'
      });
      return;
    }
    
    toast({
      title: 'Document created',
      description: 'Your new lease document has been created.',
    });
    
    // Reset form
    setDocumentName('');
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Lease Documents</h2>
          <p className="text-muted-foreground">Create and manage lease agreements</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-5 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create New Document</CardTitle>
              <CardDescription>
                Generate a new lease or rental agreement
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="document-name">Document Name</Label>
                <Input 
                  id="document-name" 
                  placeholder="e.g., Westdale Apartment Lease 2023" 
                  value={documentName}
                  onChange={(e) => setDocumentName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="template-type">Template Type</Label>
                <Select value={templateType} onValueChange={setTemplateType}>
                  <SelectTrigger id="template-type">
                    <SelectValue placeholder="Select template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard Residential Lease</SelectItem>
                    <SelectItem value="student">Student Housing Agreement</SelectItem>
                    <SelectItem value="short-term">Short-Term Rental</SelectItem>
                    <SelectItem value="room">Room Rental Agreement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Select Property</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select property" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Cozy Student Suite near McMaster University</SelectItem>
                    <SelectItem value="2">Modern Apartment in Westdale</SelectItem>
                    <SelectItem value="3">Spacious 2BR with Campus View</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Tenant(s)</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select tenant" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Morgan Smith</SelectItem>
                    <SelectItem value="2">Taylor Reed</SelectItem>
                    <SelectItem value="3">Jamie Allen</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input type="date" id="start-date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-date">End Date</Label>
                  <Input type="date" id="end-date" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="rent-amount">Monthly Rent</Label>
                <Input type="number" id="rent-amount" placeholder="e.g., 1200" />
              </div>
              
              <Button className="w-full" onClick={handleCreateDocument}>
                <FileText className="mr-2 h-4 w-4" />
                Create Document
              </Button>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-7">
          <Card>
            <CardHeader>
              <CardTitle>Document Library</CardTitle>
              <CardDescription>
                Your lease agreements and rental documents
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-md border">
                <div className="flex items-center p-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <FileArchive className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="font-medium">Modern Apartment Lease - Morgan Smith</p>
                        <p className="text-xs text-muted-foreground">Created Sep 10, 2023 • Standard Residential Lease</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Active</Badge>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex items-center p-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <FileArchive className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="font-medium">Student Housing Agreement - Taylor Reed</p>
                        <p className="text-xs text-muted-foreground">Created Aug 15, 2023 • Student Housing Agreement</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Active</Badge>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex items-center p-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <FileArchive className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="font-medium">2BR Campus View - Jamie Allen</p>
                        <p className="text-xs text-muted-foreground">Created Jul 5, 2023 • Standard Residential Lease</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Active</Badge>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 space-y-4">
                <h3 className="font-medium">Document Templates</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4 hover:border-primary transition-colors">
                    <div className="flex items-center gap-3 mb-2">
                      <FileText className="h-5 w-5 text-primary" />
                      <p className="font-medium">Standard Residential Lease</p>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">
                      Comprehensive lease agreement for residential properties
                    </p>
                    <Button variant="outline" size="sm" className="w-full">Use Template</Button>
                  </div>
                  
                  <div className="border rounded-lg p-4 hover:border-primary transition-colors">
                    <div className="flex items-center gap-3 mb-2">
                      <FileText className="h-5 w-5 text-primary" />
                      <p className="font-medium">Student Housing Agreement</p>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">
                      Tailored for student tenants with academic year terms
                    </p>
                    <Button variant="outline" size="sm" className="w-full">Use Template</Button>
                  </div>
                  
                  <div className="border rounded-lg p-4 hover:border-primary transition-colors">
                    <div className="flex items-center gap-3 mb-2">
                      <FileText className="h-5 w-5 text-primary" />
                      <p className="font-medium">Short-Term Rental</p>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">
                      For rentals less than 6 months with flexible terms
                    </p>
                    <Button variant="outline" size="sm" className="w-full">Use Template</Button>
                  </div>
                  
                  <div className="border rounded-lg p-4 hover:border-primary transition-colors">
                    <div className="flex items-center gap-3 mb-2">
                      <FileText className="h-5 w-5 text-primary" />
                      <p className="font-medium">Room Rental Agreement</p>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">
                      For renting individual rooms in shared accommodations
                    </p>
                    <Button variant="outline" size="sm" className="w-full">Use Template</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Component for rent payments and financial tracking
const FinancialTracking = () => {
  const { toast } = useToast();
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="success">Paid</Badge>;
      case 'late':
        return <Badge variant="destructive">Late</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };
  
  const handleSendReminder = (id: number) => {
    toast({
      title: "Reminder sent",
      description: "Payment reminder has been sent to the tenant.",
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Financial Management</h2>
          <p className="text-muted-foreground">Track rent payments and financial activity</p>
        </div>
        <Button>
          <CircleDollarSign className="mr-2 h-4 w-4" />
          Record Payment
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Monthly Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$3,600</div>
            <p className="text-xs text-muted-foreground">From 3 active rental properties</p>
            <div className="mt-4 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
              <div className="bg-green-500 h-1 rounded-full" style={{width: '100%'}}></div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Outstanding Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$2,400</div>
            <p className="text-xs text-muted-foreground">From 2 properties with pending payments</p>
            <div className="mt-4 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
              <div className="bg-amber-500 h-1 rounded-full" style={{width: '67%'}}></div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Payment Collection Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">33%</div>
            <p className="text-xs text-muted-foreground">For October 2023 (1/3 collected)</p>
            <div className="mt-4 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
              <div className="bg-blue-500 h-1 rounded-full" style={{width: '33%'}}></div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Rent Payment Tracker</CardTitle>
          <CardDescription>
            Monitor upcoming rent payments and collection status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="grid grid-cols-7 border-b px-4 py-3 text-sm font-medium">
              <div className="col-span-2">Tenant</div>
              <div>Property</div>
              <div>Amount</div>
              <div>Due Date</div>
              <div>Status</div>
              <div className="text-right">Actions</div>
            </div>
            
            {payments.map((payment) => (
              <div key={payment.id} className="grid grid-cols-7 items-center px-4 py-3 border-b last:border-b-0">
                <div className="col-span-2 font-medium">{payment.tenant}</div>
                <div className="text-sm truncate">{payment.property.split(' ').slice(0, 3).join(' ')}...</div>
                <div>${payment.amount}</div>
                <div>{payment.dueDate}</div>
                <div>{getStatusBadge(payment.status)}</div>
                <div className="flex justify-end gap-2">
                  {payment.status === 'pending' || payment.status === 'late' ? (
                    <Button variant="outline" size="sm" onClick={() => handleSendReminder(payment.id)}>
                      Send Reminder
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm">
                      View Receipt
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue</CardTitle>
            <CardDescription>
              Rent collection for the last 6 months
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-60 flex items-end justify-between">
              {['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'].map((month, i) => (
                <div key={month} className="flex flex-col items-center">
                  <div 
                    className="w-12 bg-primary/90 rounded-t-md" 
                    style={{ 
                      height: `${[75, 80, 85, 90, 95, 33][i]}%`,
                      opacity: i === 5 ? 0.5 : 1
                    }}
                  ></div>
                  <div className="mt-2 text-xs">{month}</div>
                  <div className="text-xs font-medium">
                    ${[2700, 2880, 3060, 3240, 3420, 1200][i]}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
            <CardDescription>
              How tenants are paying their rent
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center">
              <div className="w-40 h-40 rounded-full border-8 border-primary/20 relative mb-6">
                <div 
                  className="absolute top-0 left-0 w-40 h-40 rounded-full border-8 border-t-primary border-l-primary border-r-transparent border-b-transparent"
                  style={{ transform: 'rotate(-45deg)' }}
                ></div>
                <div className="absolute inset-0 flex items-center justify-center text-lg font-bold">
                  50%
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 w-full">
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-primary mr-2"></div>
                  <div>
                    <p className="text-sm font-medium">Bank Transfer</p>
                    <p className="text-xs text-muted-foreground">1 property</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-primary/20 mr-2"></div>
                  <div>
                    <p className="text-sm font-medium">Pending</p>
                    <p className="text-xs text-muted-foreground">2 properties</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Main Landlord Tools page component
export default function LandlordToolsPage() {
  const [activeTab, setActiveTab] = useState("tenant-screening");
  const { user } = useAuth();
  
  // Redirect non-landlord users
  if (user && user.userType !== 'landlord') {
    return <Redirect to="/" />;
  }
  
  return (
    <div className="container max-w-7xl mx-auto px-4 py-8 pt-24">
      <div className="flex items-center mb-6">
        <LayoutDashboard className="h-6 w-6 mr-2 text-primary" />
        <h1 className="text-2xl font-bold">Landlord Management Tools</h1>
      </div>
      
      <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="tenant-screening">
            <Users className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Tenant Screening</span>
            <span className="sm:hidden">Screening</span>
          </TabsTrigger>
          <TabsTrigger value="maintenance">
            <Wrench className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Maintenance</span>
            <span className="sm:hidden">Repairs</span>
          </TabsTrigger>
          <TabsTrigger value="lease-management">
            <FileText className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Lease Management</span>
            <span className="sm:hidden">Leases</span>
          </TabsTrigger>
          <TabsTrigger value="financial">
            <BarChart3 className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Financial Tracking</span>
            <span className="sm:hidden">Finances</span>
          </TabsTrigger>
        </TabsList>
        
        <div className="mt-6">
          <TabsContent value="tenant-screening">
            <TenantScreening />
          </TabsContent>
          
          <TabsContent value="maintenance">
            <MaintenanceManagement />
          </TabsContent>
          
          <TabsContent value="lease-management">
            <LeaseManagement />
          </TabsContent>
          
          <TabsContent value="financial">
            <FinancialTracking />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}