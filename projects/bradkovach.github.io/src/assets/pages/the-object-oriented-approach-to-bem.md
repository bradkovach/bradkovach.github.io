---
title: The Object-Oriented Approach To BEM
created: 2024-03-21T01:28:27.307Z
category:
  - Web Development
tag:
  - SCSS
  - CSS
  - BEM
  - TypeScript
  - Object-Oriented Programming
---

This article serves as a guide to implementing the BEM methodology using an object-oriented approach. The goal is to create a durable blueprint for a scalable and maintainable CSS architecture.

### Motivation

Many people struggle with CSS. It is a powerful declarative language that can be used to create complex data models. Many developers that are not fanatical CSS users often struggle with turning their data model into sustainable and maintainable code. Many CSS methodologies have been developed to address this problem. One of the most popular methodologies is BEM. However, BEM's Block-Element-Modifier doesn't immediately elicit an object-oriented approach.

This guide will help you adapt some of your favorite object-oriented programming principles to your CSS architecture. This guide will use TypeScript and SCSS to demonstrate the principles, but the principles can be applied to any language that supports object-oriented programming and a CSS preprocessor (or even vanilla CSS).

### The Data Model

Let's take a hypothetical blog scenario. The `Blog` itself is part of the data model. The `Blog` has many `Post` objects, and many `User` objects. Each `Post` has many `Comment` objects. Each `User` has many `Post` objects. Each `Comment` has one `User` object. Each object has some properties that define their purpose within the data model, such as `title` and `content` for `Post`, `username` for `User`, and `content` for `Comment` and `Post`.

```typescript
interface Blog {
  posts: Post[];
  users: User[];
}

interface Post {
  title: string;
  content: string;

  author: User;

  comments: Comment[];

  isFeatured(): boolean;
}

interface User {
  username: string;
  posts: Post[];
}

interface Comment {
  author: User;
  content: string;

  isAuthor(): boolean;
}
```

### Scaffold the classes

The general strategy for scaffolding class names is to use the BEM methodology.

- A `Block` corresponds to an entity in our data model, expressed as the singular noun form.
- An `Element` corresponds to a property of the entity, expressed as the appropriate noun form.
- A `Modifier` corresponds to a boolean state of the entity, usually calculated.

Whenever a property is created for an array of items, so too is an element created for the items in the array. For example, `blog.posts` an array that is mapped to Element `.blog__posts`, and it will be filled with `.post` Blocks. **This separates the styling context for the `Post` from the `Blog`, while explicitly defining the relationship between the two.**

```scss
.blog {
  // block => class/entity
  .blog__title {
    // element => property
  }

  .blog__posts {
    // element => property (array of blocks)
  }

  .blog__users {
    // element => property (array of blocks)
  }
}

.post {
  // block => class/entity
  .post__title {
    // element => property
  }

  .post__author {
    // element => property
  }

  .post__content {
    // element => property
  }

  .post__comments {
    // element => property (array of blocks)
  }
}

.user {
  // user.username
  .user__username {
  }

  // user.posts
  .user__posts {
  }
}

.comment {
  // block => class/entity
  .comment__author {
    // element => property
  }

  .comment__content {
    // element => property
  }
}
```

Now, we can start defining our markup. It's a tad verbose, but it's also very descriptive (and nowhere near as verbose as a utility-first library), and this will help us separate concerns and maintain our codebase as the needs of the project grow.

```html
<div class="blog">
  <h1 class="blog__title"></h1>
  <div class="blog__posts">
    <div class="post">
      <div class="post__title"></div>
      <div class="post__author"></div>
      <div class="post__content"></div>
      <div class="post__comments">
        <div class="comment">
          <div class="comment__author"></div>
          <div class="comment__content"></div>
        </div>

        <div class="comment">
          <div class="comment__author"></div>
          <div class="comment__content"></div>
        </div>

        <div class="comment">
          <div class="comment__author"></div>
          <div class="comment__content"></div>
        </div>
      </div>
    </div>
  </div>
</div>
```

### Calculated States

The `isFeatured` method on the `Post` class is a calculated state. We can use a modifier to express this state in our markup.

The class name is typically using the gerund `-ed` form of the method name. It can also be expressed with the `is` or `has` prefix, such as `.post--is-featured` or `.post--has-comments`.

```scss
.post {
  &.post--featured {
    // modifier => calculated state
  }

  &.post--has-comments {
    // modifier => calculated state
  }
}
```
