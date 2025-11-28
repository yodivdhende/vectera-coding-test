# DECISIONS

Briefly note:
- Key choices you made & trade-offs.
- Deviations from the initial spec (if any) and why.
- Next improvements you'd make if you had more time.
- Time spent per area.


## Key choices you made & trade-offs
### Backend
**It’s my first time working with Django, so please don't be too mean.**
I looked into how I could define two actions with the same path and couldn’t find a clean way to do it, so I went with a good old *check the request.method* approach.  
For the summary, I chose threading because it’s native, but I could have used a package like `celery` instead.

### Frontend
I created a separate module for the meeting page so it would feel more like its own domain.  
All of the services that the component uses are provided on the component itself.  
This way, if the component is destroyed, the services are also destroyed — which makes state management easy.  
If we needed state management across multiple components, the providers could be moved to the module.

I tried to implement a data layer so it’s easier to adjust the typings when the endpoint changes.

## Deviations from the initial spec (if any) and why
I don’t think I deviated — I tried to follow it as closely as possible.

## Next improvements you'd make if you had more time
For both backend and frontend, I didn’t have time to write tests.

### Backend
It seems there’s a lot of code in `views.py`, so I’d love to move some of it into their own files.
I think there’s a better way to handle nested API routing. It feels a bit janky that I couldn’t use the default paginator, so I’d love to revisit that and explore a cleaner approach.

### Frontend
Add more styling (and get feedback from a designer).  
Create smaller components for the detail page so I can split up some logic.

I’m not a fan of how I handled the pagination with the side effects.  
I’d love to have another go at that.

Do some more error handling.

Set up a config file (that can be provided through pipelines) for the server URL.

Add more validators to the note form, such as whitespace checks.

## Time spent per area
I definitely went over the 6 hours, but most of the time was spent learning the basics of `Django` and `DRF`.  
Without the learning time included, I think it was around 30% backend and 70% frontend. There was simply a lot more setup required on the frontend.