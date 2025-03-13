import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2, Languages } from "lucide-react";
import { translateRequestSchema, type TranslateRequest, languageOptions, type Translation } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const { toast } = useToast();
  
  const form = useForm<TranslateRequest>({
    resolver: zodResolver(translateRequestSchema),
    defaultValues: {
      text: "",
      targetLanguage: ""
    }
  });

  const { data: recentTranslations } = useQuery<Translation[]>({
    queryKey: ["/api/translations/recent"]
  });

  const translateMutation = useMutation({
    mutationFn: async (data: TranslateRequest) => {
      const res = await apiRequest("POST", "/api/translate", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Translation successful",
        description: "Your text has been translated"
      });
    },
    onError: (error) => {
      toast({
        title: "Translation failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: TranslateRequest) => {
    translateMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Languages className="h-6 w-6" />
              Text Translator
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="text"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="Enter text to translate..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="targetLanguage"
                  render={({ field }) => (
                    <FormItem>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select target language" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {languageOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={translateMutation.isPending}>
                  {translateMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Translate
                </Button>
              </form>
            </Form>

            {translateMutation.data && (
              <div className="mt-6">
                <h3 className="font-medium mb-2">Translation:</h3>
                <div className="p-4 bg-muted rounded-md">
                  {translateMutation.data.translatedText}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {recentTranslations && recentTranslations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Translations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTranslations.map((translation) => (
                  <div key={translation.id} className="p-4 bg-muted rounded-md">
                    <p className="text-sm text-muted-foreground mb-2">
                      {new Date(translation.timestamp).toLocaleString()}
                    </p>
                    <p className="mb-2">{translation.sourceText}</p>
                    <p className="font-medium">{translation.translatedText}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
