'use client';
import * as React from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { testimonials } from '@/lib/data';

export default function TestimonialsSection() {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);

  React.useEffect(() => {
    if (!api) {
      return;
    }

    const interval = setInterval(() => {
      if (api.canScrollNext()) {
        api.scrollNext();
      } else {
        api.scrollTo(0);
      }
    }, 5000);

    api.on('select', () => {
        setCurrent(api.selectedScrollSnap());
      });

    return () => clearInterval(interval);
  }, [api]);


  return (
    <section id="testimonials" className="py-20 md:py-32">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <h2
            className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl opacity-0 animate-fade-in-up"
            style={{ animationDelay: '0.2s' }}
          >
            Loved by Crypto Earners Worldwide
          </h2>
          <p
            className="mt-6 text-lg leading-8 text-foreground/70 opacity-0 animate-fade-in-up"
            style={{ animationDelay: '0.4s' }}
          >
            Don&apos;t just take our word for it. Here&apos;s what our users have to
            say about their experience with TaskVerse.
          </p>
        </div>
        <Carousel
          setApi={setApi}
          opts={{
            align: 'start',
            loop: true,
          }}
          className="mx-auto mt-16 w-full max-w-4xl"
        >
          <CarouselContent>
            {testimonials.map((testimonial, index) => (
              <CarouselItem key={index} className="md:basis-1/2">
                <div className="p-4">
                  <Card>
                    <CardContent className="flex flex-col items-start gap-6 p-6">
                      <p className="text-foreground/80">&quot;{testimonial.text}&quot;</p>
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage src={testimonial.avatarUrl} alt={testimonial.name} data-ai-hint="person portrait" />
                          <AvatarFallback>
                            {testimonial.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{testimonial.name}</p>
                          <p className="text-sm text-foreground/60">
                            {testimonial.role}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>

        <div className="py-2 text-center text-sm text-muted-foreground">
            <div className="flex items-center justify-center gap-2 mt-4">
                {testimonials.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => api?.scrollTo(i)}
                        className={`h-2 w-2 rounded-full ${i === current ? 'bg-primary' : 'bg-muted'}`}
                        aria-label={`Go to slide ${i + 1}`}
                    />
                ))}
            </div>
        </div>

      </div>
    </section>
  );
}
