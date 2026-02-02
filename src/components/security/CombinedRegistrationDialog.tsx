import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCreateDriver } from '@/hooks/useDrivers';
import { useVehicles } from '@/hooks/useVehicles';
import { useToast } from '@/hooks/use-toast';
import { VehicleOut } from '@/api/types/vehicle.types';
import { Plus, Car, User, Loader2, CheckCircle, Camera, AlertCircle } from 'lucide-react';

const combinedSchema = z.object({
  // Vehicle fields
  registration_number: z
    .string()
    .min(4, 'Registration number must be at least 4 characters')
    .max(15, 'Registration number must be less than 15 characters')
    .regex(/^[A-Z0-9\-]+$/i, 'Invalid registration number format'),
  vehicle_type: z.string().min(1, 'Vehicle type is required'),
  manufacturer_tare_weight: z
    .string()
    .min(1, 'Tare weight is required')
    .transform((val) => parseFloat(val))
    .refine((val) => !isNaN(val) && val > 0, 'Must be a positive number'),
  fastag_id: z.string().optional(),
  // Driver fields
  driver_name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  mobile_number: z
    .string()
    .min(10, 'Mobile number must be 10 digits')
    .max(15)
    .regex(/^[0-9+\-\s]+$/, 'Invalid mobile number format'),
  aadhaar: z
    .string()
    .length(12, 'Aadhaar must be exactly 12 digits')
    .regex(/^\d+$/, 'Aadhaar must contain only digits'),
});

type CombinedFormValues = z.infer<typeof combinedSchema>;

// Interface for detected vehicle data from WebSocket
interface DetectedVehicleData {
  registrationNumber: string;
  fastagId: string;
  vehicleType: string;
  vehicleImage: string; // base64 image
}

interface CombinedRegistrationDialogProps {
  onSuccess?: () => void;
  trigger?: React.ReactNode;
  detectedData?: DetectedVehicleData;
  onLoadDetection?: () => void;
  
  // NEW PROPS
  vehicleData?: VehicleOut; // Pre-filled vehicle data when already registered
  mode?: 'vehicle' | 'driver' | 'both'; // Control which sections to show
  open?: boolean; // External control of dialog state
  onOpenChange?: (open: boolean) => void; // Handle dialog close
}

export function CombinedRegistrationDialog({ 
  onSuccess,
  trigger,
  detectedData,
  onLoadDetection,
  vehicleData,
  mode = 'both',
  open: externalOpen,
  onOpenChange: externalOnOpenChange,
}: CombinedRegistrationDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [lastLoadedDetection, setLastLoadedDetection] = useState<DetectedVehicleData | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { toast } = useToast();
  const createDriver = useCreateDriver();
  const { createVehicle } = useVehicles();

  // Use external state if provided, otherwise use internal
  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = externalOnOpenChange || setInternalOpen;

  // Determine which sections to show
  const showVehicleSection = mode === 'both' || mode === 'vehicle';
  const showDriverSection = mode === 'both' || mode === 'driver';
  
  // Vehicle fields should be disabled when mode is 'driver' only or when vehicleData is provided
  const vehicleFieldsDisabled = mode === 'driver' || !!vehicleData;

  const form = useForm<CombinedFormValues>({
    resolver: zodResolver(combinedSchema),
    defaultValues: {
      registration_number: '',
      vehicle_type: '',
      manufacturer_tare_weight: '' as any,
      fastag_id: '',
      driver_name: '',
      mobile_number: '',
      aadhaar: '',
    },
  });

  // Pre-fill form when vehicleData is provided (vehicle already registered)
  useEffect(() => {
    if (vehicleData) {
      form.setValue('registration_number', vehicleData.registration_number || '');
      form.setValue('vehicle_type', vehicleData.vehicle_type || '');
      form.setValue('manufacturer_tare_weight', vehicleData.manufacturer_tare_weight?.toString() || '' as any);
      // Note: vehicleData doesn't have fastag_id, so we keep it from detectedData if available
    }
  }, [vehicleData, form]);

  // Update captured image automatically when new detection arrives
  useEffect(() => {
    if (detectedData?.vehicleImage) {
      setCapturedImage(`data:image/jpeg;base64,${detectedData.vehicleImage}`);
    }
  }, [detectedData?.vehicleImage]);

  // Auto-load detection data when dialog opens with detected data
  useEffect(() => {
    if (open && detectedData && !vehicleData && mode !== 'driver') {
      // Automatically populate form when dialog opens with detection data
      // Only if vehicle is not already registered and mode allows vehicle entry
      
      if (detectedData.registrationNumber) {
        form.setValue('registration_number', detectedData.registrationNumber.toUpperCase());
      }

      if (detectedData.fastagId) {
        form.setValue('fastag_id', detectedData.fastagId);
      }

      if (detectedData.vehicleType) {
        form.setValue('vehicle_type', detectedData.vehicleType);
      }

      if (detectedData.vehicleImage) {
        setCapturedImage(`data:image/jpeg;base64,${detectedData.vehicleImage}`);
      }

      setLastLoadedDetection(detectedData);
      setSubmitError(null);
    }
  }, [open, detectedData, vehicleData, mode, form]);

  // Load detection data into form
  const loadDetectionIntoForm = () => {
    if (!detectedData) {
      toast({
        title: 'No Detection Available',
        description: 'Please wait for vehicle detection from camera.',
        variant: 'destructive',
      });
      return;
    }

    if (detectedData.registrationNumber && !vehicleFieldsDisabled) {
      form.setValue('registration_number', detectedData.registrationNumber.toUpperCase());
    }

    if (detectedData.fastagId) {
      form.setValue('fastag_id', detectedData.fastagId);
    }

    if (detectedData.vehicleType && !vehicleFieldsDisabled) {
      form.setValue('vehicle_type', detectedData.vehicleType);
    }

    if (detectedData.vehicleImage) {
      setCapturedImage(`data:image/jpeg;base64,${detectedData.vehicleImage}`);
    }

    setLastLoadedDetection(detectedData);
    setSubmitError(null);

    toast({
      title: 'Detection Loaded',
      description: 'Form has been populated with detected vehicle information.',
    });
  };

  // Expose load function to parent
  useEffect(() => {
    if (onLoadDetection) {
      (window as any).__loadDetectionIntoForm = loadDetectionIntoForm;
    }
  }, [detectedData, onLoadDetection]);

  // Helper function to convert base64 to File/Blob
  const base64ToFile = async (base64String: string, filename: string): Promise<File> => {
    const response = await fetch(base64String);
    const blob = await response.blob();
    return new File([blob], filename, { type: blob.type || 'image/jpeg' });
  };

  const handleSubmit = async (values: CombinedFormValues) => {
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      let vehicleSuccess = false;
      let driverSuccess = false;

      // Only create vehicle if mode is 'both' or 'vehicle' AND vehicle is not already registered
      if (showVehicleSection && !vehicleData) {
        // Create FormData for multipart/form-data upload
        const formData = new FormData();
        formData.append('registration_number', values.registration_number.toUpperCase());
        formData.append('vehicle_type', values.vehicle_type);
        formData.append('manufacturer_tare_weight', values.manufacturer_tare_weight.toString());
        
        // Map fastag_id to fastag_number (backend expects fastag_number)
        if (values.fastag_id && values.fastag_id.trim() !== '') {
          formData.append('fastag_number', values.fastag_id.trim());
        }

        // Convert base64 image to File and append
        if (capturedImage) {
          try {
            const imageFile = await base64ToFile(
              capturedImage, 
              `${values.registration_number.toUpperCase()}.jpg`
            );
            formData.append('image', imageFile);
            console.log('Image file created:', imageFile.name, imageFile.size, 'bytes');
          } catch (imageError) {
            console.error('Failed to convert image:', imageError);
            throw new Error('Failed to process vehicle image');
          }
        }

        // Debug: Log all FormData entries
        console.log('FormData contents before sending:');
        for (const [key, value] of formData.entries()) {
          console.log(`  ${key}:`, value instanceof File ? `File(${value.name}, ${value.size} bytes)` : value);
        }

        try {
          console.log('Creating vehicle with FormData...');
          const vehicleResult = await createVehicle(formData);
          vehicleSuccess = true;
          console.log('Vehicle created successfully:', vehicleResult);
        } catch (vehicleError: any) {
          console.error('Vehicle creation failed:', vehicleError);
          console.error('Error response:', vehicleError.response);
          
          const errorDetail = vehicleError.response?.data?.detail;
          const errorMessage = Array.isArray(errorDetail) 
            ? errorDetail.map((e: any) => `${e.loc?.join('.')}: ${e.msg}`).join(', ')
            : errorDetail || vehicleError.message;
          
          throw new Error(`Vehicle registration failed: ${errorMessage}`);
        }
      } else if (vehicleData) {
        // Vehicle already exists, skip vehicle creation
        vehicleSuccess = true;
        console.log('Vehicle already registered, skipping creation');
      } else {
        vehicleSuccess = true;
      }

      // Create driver if mode includes driver section
      if (showDriverSection) {
        const driverPayload = {
          driver_name: values.driver_name.trim(),
          mobile_number: values.mobile_number.trim(),
          aadhaar: values.aadhaar.trim(),
        };

        try {
          console.log('Creating driver...');
          await createDriver.mutateAsync(driverPayload);
          driverSuccess = true;
          console.log('Driver created successfully');
        } catch (driverError: any) {
          console.error('Driver creation failed:', driverError);
          
          const errorDetail = driverError.response?.data?.detail;
          const errorMessage = Array.isArray(errorDetail) 
            ? errorDetail.map((e: any) => `${e.loc?.join('.')}: ${e.msg}`).join(', ')
            : errorDetail || driverError.message;
          
          throw new Error(`Driver registration failed: ${errorMessage}`);
        }
      } else {
        driverSuccess = true;
      }

      if (vehicleSuccess && driverSuccess) {
        const successMessage = 
          mode === 'driver' 
            ? 'Driver has been registered and is pending approval.'
            : mode === 'vehicle'
            ? 'Vehicle has been registered and is pending approval.'
            : 'Both vehicle and driver have been registered and are pending approval.';

        toast({
          title: 'Registration Successful',
          description: successMessage,
        });
        
        // Clear everything after successful registration
        setOpen(false);
        form.reset();
        setCapturedImage(null);
        setLastLoadedDetection(null);
        setSubmitError(null);
        onSuccess?.();
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      
      const errorMessage = error.message || 'Failed to complete registration. Please try again.';
      
      setSubmitError(errorMessage);
      
      toast({
        title: 'Registration Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setOpen(false);
    form.reset();
    setCapturedImage(null);
    setLastLoadedDetection(null);
    setSubmitError(null);
  };

  // Determine dialog title and description based on mode
  const getDialogTitle = () => {
    switch (mode) {
      case 'driver':
        return 'Driver Registration';
      case 'vehicle':
        return 'Vehicle Registration';
      default:
        return 'Combined Registration';
    }
  };

  const getDialogDescription = () => {
    switch (mode) {
      case 'driver':
        return 'Register driver for an approved vehicle.';
      case 'vehicle':
        return 'Register a new vehicle.';
      default:
        return 'Register both vehicle and driver in a single request for faster processing.';
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="w-full">
            <Plus className="h-4 w-4" />
            {mode === 'driver' ? 'Register Driver' : mode === 'vehicle' ? 'Register Vehicle' : 'Register Vehicle & Driver'}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
          <DialogDescription>
            {getDialogDescription()}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Error Alert */}
            {submitError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            )}

            {/* Auto-detection Indicator */}
            {lastLoadedDetection && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-900">
                  <CheckCircle className="h-4 w-4" />
                  <p className="font-medium text-sm">
                    Auto-populated from camera detection
                  </p>
                  <Badge variant="outline" className="ml-auto">
                    <Camera className="h-3 w-3 mr-1" />
                    Live Capture
                  </Badge>
                </div>
              </div>
            )}

            {/* Vehicle Already Registered Indicator */}
            {vehicleData && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 text-blue-900">
                  <CheckCircle className="h-4 w-4" />
                  <p className="font-medium text-sm">
                    Vehicle already registered: {vehicleData.registration_number}
                  </p>
                  <Badge variant="outline" className="ml-auto">
                    {vehicleData.approval_status}
                  </Badge>
                </div>
              </div>
            )}

            {/* Captured Vehicle Image */}
            {capturedImage && (
              <Card className="border-blue-200 bg-blue-50/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Camera className="h-4 w-4" />
                    Captured Vehicle Image
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg overflow-hidden border border-blue-200">
                    <img 
                      src={capturedImage} 
                      alt="Detected Vehicle" 
                      className="w-full h-48 object-cover"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    This image will be uploaded to the server
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Vehicle Section - Only show if mode includes vehicle */}
            {showVehicleSection && (
              <>
                <Card className={`border-primary/20 bg-primary/5 ${vehicleFieldsDisabled ? 'opacity-75' : ''}`}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Car className="h-4 w-4" />
                      Vehicle Details
                      {vehicleFieldsDisabled && (
                        <Badge variant="secondary" className="ml-auto text-xs">
                          Pre-registered
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="registration_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Registration Number *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., MH12AB1234" 
                              {...field} 
                              disabled={vehicleFieldsDisabled}
                              className={`uppercase ${lastLoadedDetection ? 'border-green-500 bg-green-50' : ''} ${vehicleFieldsDisabled ? 'bg-muted' : ''}`}
                              onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="vehicle_type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Vehicle Type *</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="e.g., Truck, Trailer, Tipper" 
                                {...field}
                                disabled={vehicleFieldsDisabled}
                                className={`${lastLoadedDetection ? 'border-green-500 bg-green-50' : ''} ${vehicleFieldsDisabled ? 'bg-muted' : ''}`}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="manufacturer_tare_weight"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tare Weight (kg) *</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="e.g., 12000" 
                                {...field}
                                disabled={vehicleFieldsDisabled}
                                className={vehicleFieldsDisabled ? 'bg-muted' : ''}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="fastag_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>FASTag ID (Optional)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter FASTag ID" 
                              {...field}
                              disabled={vehicleFieldsDisabled}
                              className={`${lastLoadedDetection ? 'border-green-500 bg-green-50' : ''} ${vehicleFieldsDisabled ? 'bg-muted' : ''}`}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {showDriverSection && <Separator />}
              </>
            )}

            {/* Driver Section - Only show if mode includes driver */}
            {showDriverSection && (
              <Card className="border-success/20 bg-success/5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Driver Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="driver_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter driver's full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="mobile_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mobile Number *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter 10-digit number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="aadhaar"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Aadhaar Number *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="12-digit Aadhaar" 
                              maxLength={12} 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="gap-2">
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    {mode === 'driver' ? 'Register Driver' : mode === 'vehicle' ? 'Register Vehicle' : 'Register Both'}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}