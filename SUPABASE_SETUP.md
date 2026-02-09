# Supabase Setup Guide for Creative Library

This guide will help you set up your Supabase database to populate the notebooks on your Creative Library page.

## Step 1: Create the Notebooks Table

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Navigate to **Table Editor** in the left sidebar
3. Click **New Table**
4. Name the table: `notebooks`
5. Add the following columns:

| Column Name | Type | Default Value | Nullable | Description |
|------------|------|---------------|----------|-------------|
| `id` | `uuid` | `gen_random_uuid()` | No | Primary key (auto-generated) |
| `title` | `text` | - | No | Display name of the notebook (e.g., "PHOTO LOGS") |
| `type` | `text` | - | Yes | Type/category (e.g., "photo-logs", "video-logs", "posters", "writing") |
| `color` | `text` | - | Yes | Custom background color (CSS gradient or hex) |
| `url` | `text` | - | Yes | Link to navigate when notebook is clicked |
| `link` | `text` | - | Yes | Alternative link field |
| `order_index` | `integer` | `0` | Yes | Display order (lower numbers appear first) |
| `created_at` | `timestamptz` | `now()` | No | Timestamp |
| `updated_at` | `timestamptz` | `now()` | Yes | Last update timestamp |

6. Set `id` as the **Primary Key**
7. Click **Save**

## Step 2: Set Up Row Level Security (RLS)

1. In the Table Editor, click on the `notebooks` table
2. Go to the **RLS** tab
3. Enable **Enable Row Level Security**
4. Create a new policy:
   - **Policy Name**: `Allow public read access`
   - **Allowed Operation**: `SELECT`
   - **Target Roles**: `anon`, `authenticated`
   - **USING expression**: `true` (allows everyone to read)
   - Click **Save**

This allows anyone to read your notebooks (which is what you want for a public portfolio).

## Step 3: Insert Sample Data

1. In the Table Editor, click on the `notebooks` table
2. Click **Insert row** or use the SQL Editor

### Option A: Using Table Editor (Insert Row)
Click **Insert row** and add these notebooks one by one:

**Notebook 1:**
- title: `PHOTO LOGS`
- type: `photo-logs`
- order_index: `1`

**Notebook 2:**
- title: `VIDEO LOGS`
- type: `video-logs`
- order_index: `2`

**Notebook 3:**
- title: `POSTERS`
- type: `posters`
- order_index: `3`

**Notebook 4:**
- title: `WRITING`
- type: `writing`
- order_index: `4`

### Option B: Using SQL Editor (Faster)
1. Go to **SQL Editor** in the left sidebar
2. Click **New query**
3. Paste this SQL:

```sql
INSERT INTO notebooks (title, type, order_index) VALUES
  ('PHOTO LOGS', 'photo-logs', 1),
  ('VIDEO LOGS', 'video-logs', 2),
  ('POSTERS', 'posters', 3),
  ('WRITING', 'writing', 4);
```

4. Click **Run** or press `Ctrl+Enter`

## Step 4: Verify Your Configuration

Your `js/supabase-config.js` file should already have:
- `SUPABASE_URL`: Your project URL
- `SUPABASE_ANON_KEY`: Your anonymous/public key

These are already configured in your project. If you need to find them:
1. Go to **Project Settings** → **API**
2. Copy the **Project URL** and **anon/public** key

## Step 5: Test Your Page

1. Open `creative-garden.html` in your browser
2. You should see the four notebooks displayed
3. If you see an error, check the browser console (F12) for details

## Customization Options

### Custom Colors
You can set custom colors for each notebook by adding a `color` column value:
- Use CSS gradients: `linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)`
- Use hex colors: `#4A90E2`
- Use CSS color names: `blue`

### Custom Links
Add a `url` or `link` value to make notebooks clickable:
- `url`: `https://example.com/photo-logs`
- `link`: `photo-logs.html`

### Adding More Notebooks
Simply insert more rows into the `notebooks` table with:
- A unique `title`
- An `order_index` to control display order
- Optional `type`, `color`, and `url` fields

## Troubleshooting

### "Error loading notebooks"
- Check that the table name is exactly `notebooks` (lowercase)
- Verify RLS policies allow SELECT operations
- Check browser console for specific error messages

### "Supabase library not loaded"
- Ensure the Supabase script tag is in your HTML before `creative-garden.js`
- Check that the CDN link is correct: `https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2`

### Notebooks not displaying
- Verify data exists in the table (check Table Editor)
- Check that `order_index` values are set correctly
- Ensure JavaScript console shows no errors

## Next Steps

Once your notebooks are displaying:
1. Add actual links (`url` field) to navigate to content pages
2. Customize colors to match your brand
3. Add more notebooks as needed
4. Consider adding images or icons to notebooks (requires additional HTML/CSS)
