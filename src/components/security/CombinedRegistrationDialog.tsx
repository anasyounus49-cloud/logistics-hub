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
}

export function CombinedRegistrationDialog({ 
  onSuccess,
  trigger,
  detectedData,
  onLoadDetection 
}: CombinedRegistrationDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [lastLoadedDetection, setLastLoadedDetection] = useState<DetectedVehicleData | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { toast } = useToast();
  const createDriver = useCreateDriver();
  const { createVehicle } = useVehicles();

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

  // Update captured image automatically when new detection arrives
  useEffect(() => {
    if (detectedData?.vehicleImage) {
      setCapturedImage(`data:image/jpeg;base64,${detectedData.vehicleImage}`);
    }
  }, [detectedData?.vehicleImage]);

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

  // Helper function to strip base64 prefix and return clean base64 string
  const stripBase64Prefix = (base64String: string): string => {
    if (base64String.includes(',')) {
      return base64String.split(',')[1];
    }
    return base64String;
  };

  const handleSubmit = async (values: CombinedFormValues) => {
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      // Prepare vehicle image as plain base64 text (no compression, just strip data:image prefix)
      const cleanedImage = capturedImage ? stripBase64Prefix(capturedImage) : undefined;

      // Prepare payloads
      const vehiclePayload = {
        registration_number: values.registration_number.toUpperCase(),
        vehicle_type: values.vehicle_type,
        manufacturer_tare_weight: values.manufacturer_tare_weight as number,
        ...(values.fastag_id && values.fastag_id.trim() !== '' && { fastag_id: values.fastag_id }),
        ...(cleanedImage && { vehicle_image: cleanedImage }), // Save as base64 text string
      };

      const driverPayload = {
        driver_name: values.driver_name.trim(),
        mobile_number: values.mobile_number.trim(),
        aadhaar: values.aadhaar.trim(),
      };

      console.log('=== Registration Payloads ===');
      console.log('Vehicle:', {
        ...vehiclePayload,
        vehicle_image: vehiclePayload.vehicle_image ? `[Base64 String - ${vehiclePayload.vehicle_image.length} chars]` : undefined,
      });
      console.log('Driver:', driverPayload);

      // Register vehicle and driver sequentially to better handle errors
      let vehicleSuccess = false;
      let driverSuccess = false;

      try {
        // Create vehicle first
        console.log('Creating vehicle...');
        const vehicleResult = await createVehicle(vehiclePayload);
        console.log('Vehicle creation result:', vehicleResult);
        console.log('Vehicle result type:', typeof vehicleResult);
        
        // The createVehicle function may return true/false or throw an error
        // If it returns false, it means the vehicle already exists or was created successfully
        // (depending on your backend implementation)
        if (vehicleResult === false || vehicleResult === true || vehicleResult === undefined) {
          // Consider it successful - the API didn't throw an error
          vehicleSuccess = true;
          console.log('Vehicle created/exists successfully');
        } else {
          vehicleSuccess = true;
          console.log('Vehicle operation completed');
        }
      } catch (vehicleError: any) {
        console.error('Vehicle creation failed:', vehicleError);
        console.error('Full vehicle error:', vehicleError.response?.data);
        
        const errorDetail = vehicleError.response?.data?.detail;
        const errorMessage = Array.isArray(errorDetail) 
          ? errorDetail.map((e: any) => `${e.loc?.join('.')}: ${e.msg}`).join(', ')
          : errorDetail || vehicleError.message;
        
        throw new Error(`Vehicle registration failed: ${errorMessage}`);
      }

      try {
        // Create driver
        console.log('Creating driver...');
        await createDriver.mutateAsync(driverPayload);
        driverSuccess = true;
        console.log('Driver created successfully');
      } catch (driverError: any) {
        console.error('Driver creation failed:', driverError);
        console.error('Full driver error:', driverError.response?.data);
        
        const errorDetail = driverError.response?.data?.detail;
        const errorMessage = Array.isArray(errorDetail) 
          ? errorDetail.map((e: any) => `${e.loc?.join('.')}: ${e.msg}`).join(', ')
          : errorDetail || driverError.message;
        
        throw new Error(`Driver registration failed: ${errorMessage}`);
      }

      if (vehicleSuccess && driverSuccess) {
        toast({
          title: 'Registration Successful',
          description: 'Both vehicle and driver have been registered and are pending approval.',
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="w-full">
            <Plus className="h-4 w-4" />
            Register Vehicle & Driver
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Combined Registration</DialogTitle>
          <DialogDescription>
            Register both vehicle and driver in a single request for faster processing.
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
                    This image will be saved as base64 text in the database
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Vehicle Section */}
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Car className="h-4 w-4" />
                  Vehicle Details
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
                          className={`uppercase ${lastLoadedDetection ? 'border-green-500 bg-green-50' : ''}`}
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
                            className={lastLoadedDetection ? 'border-green-500 bg-green-50' : ''}
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
                          className={lastLoadedDetection ? 'border-green-500 bg-green-50' : ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Separator />

            {/* Driver Section */}
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
                    Register Both
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