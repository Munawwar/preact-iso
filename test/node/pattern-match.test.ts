// Test this file by running:
// npx tsc --noEmit test/node/pattern-match.test.ts

type PatternMatch<Re extends string> = Re extends '*'
	? { params: {}; rest: string }

	: Re extends `:${infer placeholder}?/${infer rest}`
	? { [k in placeholder]?: string } & { params: PatternMatch<rest>['params'] & { [k in placeholder]?: string } } & Omit<PatternMatch<rest>, 'params'>

	: Re extends `:${infer placeholder}/${infer rest}`
	? { [k in placeholder]: string } & { params: PatternMatch<rest>['params'] & { [k in placeholder]: string } } & Omit<PatternMatch<rest>, 'params'>

	: Re extends `:${infer placeholder}?`
	? { [k in placeholder]?: string } & { params: { [k in placeholder]?: string } }

	: Re extends `:${infer placeholder}*`
	? { [k in placeholder]?: string } & { params: { [k in placeholder]?: string } }

	: Re extends `:${infer placeholder}+`
	? { [k in placeholder]: string } & { params: { [k in placeholder]: string } }

	: Re extends `:${infer placeholder}`
	? { [k in placeholder]: string } & { params: { [k in placeholder]: string } }
	
	: Re extends (`/${infer rest}` | `${infer _}/${infer rest}`)
	? PatternMatch<rest>

	: { params: {} };

// Test utils

type isEqualsType<T, U> = T extends U ? U extends T ? true : false : false;
type isWeakEqualsType<T, U> = T extends U ? true : false;

// Type tests based on router-match.test.js cases

// Base route test
const test1: isEqualsType<
  PatternMatch<'/'> ,
	{ params: {} }
> = true;

const test1_1: isEqualsType<
  PatternMatch<'/'> ,
	{ arbitrary: {} }
> = false;

// Param route test
const test2: isEqualsType<
  PatternMatch<'/user/:id'> ,
  { params: { id: string }, id: string }
> = true;

const test2_weak: isWeakEqualsType<
  PatternMatch<'/user/:id'> ,
  { params: { id: string } }
> = true;

// Param rest segment test
const test3: isEqualsType<
  PatternMatch<'/user/*'> ,
  { params: {}, rest: string }
> = true;

const test3_1: isEqualsType<
  PatternMatch<'/*'> ,
  { params: {}, rest: string }
> = true;

const test3_2: isEqualsType<
  PatternMatch<'*'> ,
  { params: {}, rest: string }
> = true;

// Param route with rest segment test
const test4: isEqualsType<
  PatternMatch<'/user/:id/*'> ,
  { params: { id: string }, id: string, rest: string }
> = true;

// Optional param route test
const test5: isEqualsType<
  PatternMatch<'/user/:id?'> ,
	{ params: { id?: string }, id?: string }
> = true;

// Optional rest param route "/:x*" test
const test6: isEqualsType<
  PatternMatch<'/user/:id*'> ,
  { params: { id?: string }, id?: string }
> = true;

// rest param should not be present
const test6_error: isEqualsType<
  PatternMatch<'/user/:id*'> ,
  { params: { id: string }, rest: string }
> = false;

// Rest param route "/:x+" test
const test7: isEqualsType<
  PatternMatch<'/user/:id+'> ,
  { params: { id: string }, id: string }
> = true;

// rest param should not be present
const test7_error: isEqualsType<
  PatternMatch<'/user/:id+'>,
  { params: { id: string }, id: string, rest: string }
> = false;

// Handles leading/trailing slashes test
const test8: isEqualsType<
  PatternMatch<'/about-late/:seg1/:seg2/'> ,
  { params: { seg1: string; seg2: string }, seg1: string, seg2: string }
> = true;

// Multiple params test (from overwrite properties test)
const test9: isEqualsType<
  PatternMatch<'/:path/:query'> ,
  { params: { path: string; query: string }, path: string, query: string }
> = true;

// Empty route test
const test10: isEqualsType<
  PatternMatch<''> ,
  { params: {} }
> = true;
