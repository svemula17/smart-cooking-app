--
-- PostgreSQL database dump
--


-- Dumped from database version 16.14
-- Dumped by pg_dump version 16.14

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: citext; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS citext WITH SCHEMA public;


--
-- Name: pg_trgm; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: recipe_reviews_rating_aggregate(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.recipe_reviews_rating_aggregate() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM recompute_recipe_rating(OLD.recipe_id);
        RETURN OLD;
    END IF;

    PERFORM recompute_recipe_rating(NEW.recipe_id);
    -- Handle UPDATE that changes recipe_id (very unusual but possible).
    IF TG_OP = 'UPDATE' AND OLD.recipe_id <> NEW.recipe_id THEN
        PERFORM recompute_recipe_rating(OLD.recipe_id);
    END IF;
    RETURN NEW;
END;
$$;


--
-- Name: recompute_recipe_rating(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.recompute_recipe_rating(p_recipe_id uuid) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_avg   NUMERIC(3, 2);
    v_total INTEGER;
BEGIN
    SELECT COALESCE(ROUND(AVG(rating)::numeric, 2), 0),
           COUNT(*)
      INTO v_avg, v_total
      FROM recipe_reviews
     WHERE recipe_id = p_recipe_id;

    INSERT INTO recipe_ratings (recipe_id, average_rating, total_ratings, updated_at)
    VALUES (p_recipe_id, v_avg, v_total, NOW())
    ON CONFLICT (recipe_id) DO UPDATE SET
        average_rating = EXCLUDED.average_rating,
        total_ratings  = EXCLUDED.total_ratings,
        updated_at     = NOW();
END;
$$;


--
-- Name: set_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: chore_schedule; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.chore_schedule (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    house_id uuid NOT NULL,
    chore_type_id uuid NOT NULL,
    user_id uuid NOT NULL,
    scheduled_date date NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chore_schedule_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'done'::text, 'skipped'::text])))
);


--
-- Name: cook_recipe_proposals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cook_recipe_proposals (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    cook_schedule_id uuid NOT NULL,
    house_id uuid NOT NULL,
    recipe_ids jsonb DEFAULT '[]'::jsonb NOT NULL,
    status text DEFAULT 'voting'::text NOT NULL,
    selected_recipe_id uuid,
    voting_ends_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT cook_recipe_proposals_status_check CHECK ((status = ANY (ARRAY['voting'::text, 'decided'::text])))
);


--
-- Name: cook_recipe_votes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cook_recipe_votes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    proposal_id uuid NOT NULL,
    user_id uuid NOT NULL,
    recipe_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: cook_schedule; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cook_schedule (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    house_id uuid NOT NULL,
    user_id uuid NOT NULL,
    scheduled_date date NOT NULL,
    recipe_id uuid,
    status text DEFAULT 'pending'::text NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT cook_schedule_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'cooking'::text, 'done'::text, 'skipped'::text])))
);


--
-- Name: cook_swap_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cook_swap_requests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    house_id uuid NOT NULL,
    requester_id uuid NOT NULL,
    requester_schedule_id uuid NOT NULL,
    target_id uuid NOT NULL,
    target_schedule_id uuid NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT cook_swap_requests_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'accepted'::text, 'declined'::text])))
);


--
-- Name: cooking_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cooking_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    recipe_id uuid NOT NULL,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    completed_at timestamp with time zone,
    status character varying(20) DEFAULT 'in_progress'::character varying NOT NULL,
    CONSTRAINT cooking_sessions_completed_after_started CHECK (((completed_at IS NULL) OR (completed_at >= started_at))),
    CONSTRAINT cooking_sessions_completed_consistency CHECK (((((status)::text = 'in_progress'::text) AND (completed_at IS NULL)) OR ((status)::text = ANY ((ARRAY['completed'::character varying, 'abandoned'::character varying])::text[])))),
    CONSTRAINT cooking_sessions_status_valid CHECK (((status)::text = ANY ((ARRAY['in_progress'::character varying, 'completed'::character varying, 'abandoned'::character varying])::text[])))
);


--
-- Name: daily_nutrition; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.daily_nutrition (
    user_id uuid NOT NULL,
    date date NOT NULL,
    total_calories integer DEFAULT 0 NOT NULL,
    total_protein_g numeric(8,2) DEFAULT 0 NOT NULL,
    total_carbs_g numeric(8,2) DEFAULT 0 NOT NULL,
    total_fat_g numeric(8,2) DEFAULT 0 NOT NULL,
    goal_calories integer DEFAULT 2000 NOT NULL,
    goal_protein_g numeric(8,2) DEFAULT 100 NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT daily_nutrition_calories_nonneg CHECK ((total_calories >= 0)),
    CONSTRAINT daily_nutrition_carbs_nonneg CHECK ((total_carbs_g >= (0)::numeric)),
    CONSTRAINT daily_nutrition_fat_nonneg CHECK ((total_fat_g >= (0)::numeric)),
    CONSTRAINT daily_nutrition_goal_calories_positive CHECK ((goal_calories > 0)),
    CONSTRAINT daily_nutrition_goal_protein_nonneg CHECK ((goal_protein_g >= (0)::numeric)),
    CONSTRAINT daily_nutrition_protein_nonneg CHECK ((total_protein_g >= (0)::numeric))
);


--
-- Name: expense_splits; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.expense_splits (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    expense_id uuid NOT NULL,
    user_id uuid NOT NULL,
    amount numeric(10,2) NOT NULL,
    is_settled boolean DEFAULT false NOT NULL,
    settled_at timestamp with time zone,
    CONSTRAINT expense_splits_amount_check CHECK ((amount > (0)::numeric))
);


--
-- Name: expenses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.expenses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    house_id uuid NOT NULL,
    paid_by uuid NOT NULL,
    amount numeric(10,2) NOT NULL,
    description text NOT NULL,
    category text DEFAULT 'groceries'::text NOT NULL,
    shopping_list_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT expenses_amount_check CHECK ((amount > (0)::numeric))
);


--
-- Name: grocery_budgets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.grocery_budgets (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    house_id uuid NOT NULL,
    month text NOT NULL,
    amount numeric(10,2) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT grocery_budgets_amount_check CHECK ((amount > (0)::numeric))
);


--
-- Name: house_achievements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.house_achievements (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    house_id uuid NOT NULL,
    achievement_key text NOT NULL,
    earned_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: house_attendance; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.house_attendance (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    house_id uuid NOT NULL,
    user_id uuid NOT NULL,
    attendance_date date NOT NULL,
    is_attending boolean DEFAULT true NOT NULL,
    responded_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: house_chore_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.house_chore_types (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    house_id uuid NOT NULL,
    name text NOT NULL,
    emoji text DEFAULT '🧹'::text NOT NULL,
    frequency text DEFAULT 'daily'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT house_chore_types_frequency_check CHECK ((frequency = ANY (ARRAY['daily'::text, 'weekly'::text])))
);


--
-- Name: house_members; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.house_members (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    house_id uuid NOT NULL,
    user_id uuid NOT NULL,
    role text DEFAULT 'member'::text NOT NULL,
    joined_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT house_members_role_check CHECK ((role = ANY (ARRAY['admin'::text, 'member'::text])))
);


--
-- Name: house_pantry_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.house_pantry_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    house_id uuid NOT NULL,
    added_by uuid NOT NULL,
    name text NOT NULL,
    quantity numeric(10,2) DEFAULT 1 NOT NULL,
    unit text DEFAULT 'units'::text NOT NULL,
    category text DEFAULT 'other'::text NOT NULL,
    location text DEFAULT 'pantry'::text NOT NULL,
    expiry_date date,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT house_pantry_items_quantity_check CHECK ((quantity >= (0)::numeric))
);


--
-- Name: houses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.houses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    invite_code text NOT NULL,
    created_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: meal_plans; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.meal_plans (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    recipe_id uuid NOT NULL,
    scheduled_date date NOT NULL,
    meal_type character varying(20) NOT NULL,
    cooking_time time without time zone DEFAULT '18:00:00'::time without time zone,
    completed boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    house_id uuid,
    CONSTRAINT meal_plans_meal_type_check CHECK (((meal_type)::text = ANY ((ARRAY['breakfast'::character varying, 'lunch'::character varying, 'dinner'::character varying])::text[])))
);


--
-- Name: meal_ratings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.meal_ratings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    cook_schedule_id uuid NOT NULL,
    house_id uuid NOT NULL,
    rated_by uuid NOT NULL,
    rating integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT meal_ratings_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


--
-- Name: nutrition_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.nutrition_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    recipe_id uuid,
    date date NOT NULL,
    meal_type character varying(20) NOT NULL,
    servings_consumed numeric(6,2) DEFAULT 1 NOT NULL,
    calories integer NOT NULL,
    protein_g numeric(8,2) NOT NULL,
    carbs_g numeric(8,2) NOT NULL,
    fat_g numeric(8,2) NOT NULL,
    logged_at timestamp with time zone DEFAULT now() NOT NULL,
    auto_logged boolean DEFAULT false NOT NULL,
    CONSTRAINT nutrition_logs_calories_nonneg CHECK ((calories >= 0)),
    CONSTRAINT nutrition_logs_carbs_nonneg CHECK ((carbs_g >= (0)::numeric)),
    CONSTRAINT nutrition_logs_fat_nonneg CHECK ((fat_g >= (0)::numeric)),
    CONSTRAINT nutrition_logs_meal_type_valid CHECK (((meal_type)::text = ANY ((ARRAY['Breakfast'::character varying, 'Lunch'::character varying, 'Dinner'::character varying, 'Snack'::character varying])::text[]))),
    CONSTRAINT nutrition_logs_protein_nonneg CHECK ((protein_g >= (0)::numeric)),
    CONSTRAINT nutrition_logs_servings_positive CHECK ((servings_consumed > (0)::numeric))
);


--
-- Name: pantry_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pantry_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    name text NOT NULL,
    quantity numeric(10,2) DEFAULT 1 NOT NULL,
    unit text DEFAULT 'units'::text NOT NULL,
    category text DEFAULT 'other'::text NOT NULL,
    location text DEFAULT 'pantry'::text NOT NULL,
    expiry_date date,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: prep_meals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.prep_meals (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    house_id uuid NOT NULL,
    cooked_by uuid NOT NULL,
    recipe_id uuid NOT NULL,
    total_portions integer NOT NULL,
    remaining_portions integer NOT NULL,
    cooked_at timestamp with time zone DEFAULT now() NOT NULL,
    available_until date,
    CONSTRAINT prep_meals_remaining_portions_check CHECK ((remaining_portions >= 0)),
    CONSTRAINT prep_meals_total_portions_check CHECK ((total_portions > 0))
);


--
-- Name: recipe_ingredients; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.recipe_ingredients (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    recipe_id uuid NOT NULL,
    ingredient_name character varying(255) NOT NULL,
    quantity numeric(10,3) NOT NULL,
    unit character varying(50) NOT NULL,
    notes text,
    CONSTRAINT recipe_ingredients_quantity_positive CHECK ((quantity > (0)::numeric))
);


--
-- Name: recipe_nutrition; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.recipe_nutrition (
    recipe_id uuid NOT NULL,
    calories integer NOT NULL,
    protein_g numeric(8,2) NOT NULL,
    carbs_g numeric(8,2) NOT NULL,
    fat_g numeric(8,2) NOT NULL,
    fiber_g numeric(8,2) DEFAULT 0 NOT NULL,
    sodium_mg numeric(10,2) DEFAULT 0 NOT NULL,
    verified_date timestamp with time zone,
    verified_by uuid,
    CONSTRAINT recipe_nutrition_calories_nonneg CHECK ((calories >= 0)),
    CONSTRAINT recipe_nutrition_carbs_nonneg CHECK ((carbs_g >= (0)::numeric)),
    CONSTRAINT recipe_nutrition_fat_nonneg CHECK ((fat_g >= (0)::numeric)),
    CONSTRAINT recipe_nutrition_fiber_nonneg CHECK ((fiber_g >= (0)::numeric)),
    CONSTRAINT recipe_nutrition_protein_nonneg CHECK ((protein_g >= (0)::numeric)),
    CONSTRAINT recipe_nutrition_sodium_nonneg CHECK ((sodium_mg >= (0)::numeric)),
    CONSTRAINT recipe_nutrition_verified_consistency CHECK ((((verified_date IS NULL) AND (verified_by IS NULL)) OR ((verified_date IS NOT NULL) AND (verified_by IS NOT NULL))))
);


--
-- Name: recipe_ratings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.recipe_ratings (
    recipe_id uuid NOT NULL,
    average_rating numeric(3,2) DEFAULT 0 NOT NULL,
    total_ratings integer DEFAULT 0 NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT recipe_ratings_avg_range CHECK (((average_rating >= (0)::numeric) AND (average_rating <= (5)::numeric))),
    CONSTRAINT recipe_ratings_total_nonneg CHECK ((total_ratings >= 0))
);


--
-- Name: recipe_reviews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.recipe_reviews (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    recipe_id uuid NOT NULL,
    user_id uuid NOT NULL,
    rating integer NOT NULL,
    comment text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT recipe_reviews_rating_range CHECK (((rating >= 1) AND (rating <= 5)))
);


--
-- Name: recipes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.recipes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    cuisine_type character varying(50),
    difficulty character varying(20),
    prep_time_minutes integer DEFAULT 0 NOT NULL,
    cook_time_minutes integer DEFAULT 0 NOT NULL,
    servings integer DEFAULT 1 NOT NULL,
    instructions jsonb DEFAULT '[]'::jsonb NOT NULL,
    image_url character varying(500),
    verified_by_dietitian boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    marination_time_minutes integer,
    soaking_time_minutes integer,
    prep_instructions jsonb,
    CONSTRAINT recipes_cook_time_nonneg CHECK ((cook_time_minutes >= 0)),
    CONSTRAINT recipes_difficulty_valid CHECK (((difficulty IS NULL) OR ((difficulty)::text = ANY ((ARRAY['Easy'::character varying, 'Medium'::character varying, 'Hard'::character varying])::text[])))),
    CONSTRAINT recipes_instructions_is_array CHECK ((jsonb_typeof(instructions) = 'array'::text)),
    CONSTRAINT recipes_prep_time_nonneg CHECK ((prep_time_minutes >= 0)),
    CONSTRAINT recipes_servings_positive CHECK ((servings > 0))
);


--
-- Name: refresh_token_denylist; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.refresh_token_denylist (
    jti uuid NOT NULL,
    user_id uuid NOT NULL,
    revoked_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    CONSTRAINT refresh_token_denylist_expires_after_revoked CHECK ((expires_at >= revoked_at))
);


--
-- Name: shopping_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shopping_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    list_id uuid NOT NULL,
    ingredient_name character varying(255) NOT NULL,
    quantity numeric(10,3) DEFAULT 1 NOT NULL,
    unit character varying(50) DEFAULT 'unit'::character varying NOT NULL,
    is_checked boolean DEFAULT false NOT NULL,
    aisle character varying(100),
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT shopping_items_quantity_positive CHECK ((quantity > (0)::numeric))
);


--
-- Name: shopping_lists; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shopping_lists (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    name character varying(255) DEFAULT 'My Shopping List'::character varying NOT NULL,
    recipe_ids jsonb DEFAULT '[]'::jsonb NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    completed_at timestamp with time zone,
    house_id uuid,
    CONSTRAINT shopping_lists_status_valid CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'completed'::character varying])::text[])))
);


--
-- Name: shopping_shopper_rotation; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shopping_shopper_rotation (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    house_id uuid NOT NULL,
    user_id uuid NOT NULL,
    week_start date NOT NULL,
    completed boolean DEFAULT false NOT NULL
);


--
-- Name: user_achievements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_achievements (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    house_id uuid,
    achievement_key text NOT NULL,
    earned_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: user_preferences; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_preferences (
    user_id uuid NOT NULL,
    daily_calories integer DEFAULT 2000 NOT NULL,
    daily_protein integer DEFAULT 100 NOT NULL,
    daily_carbs integer DEFAULT 250 NOT NULL,
    daily_fat integer DEFAULT 65 NOT NULL,
    dietary_restrictions jsonb DEFAULT '[]'::jsonb NOT NULL,
    favorite_cuisines jsonb DEFAULT '[]'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT user_preferences_calories_positive CHECK ((daily_calories > 0)),
    CONSTRAINT user_preferences_carbs_positive CHECK ((daily_carbs >= 0)),
    CONSTRAINT user_preferences_cuisines_is_array CHECK ((jsonb_typeof(favorite_cuisines) = 'array'::text)),
    CONSTRAINT user_preferences_fat_positive CHECK ((daily_fat >= 0)),
    CONSTRAINT user_preferences_protein_positive CHECK ((daily_protein >= 0)),
    CONSTRAINT user_preferences_restrictions_is_array CHECK ((jsonb_typeof(dietary_restrictions) = 'array'::text))
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email public.citext NOT NULL,
    password_hash character varying(255) NOT NULL,
    name character varying(255),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    is_admin boolean DEFAULT false NOT NULL,
    cook_skill text DEFAULT 'beginner'::text NOT NULL,
    CONSTRAINT users_cook_skill_check CHECK ((cook_skill = ANY (ARRAY['beginner'::text, 'intermediate'::text, 'advanced'::text]))),
    CONSTRAINT users_email_format CHECK ((email OPERATOR(public.~*) '^[^@\s]+@[^@\s]+\.[^@\s]+$'::public.citext))
);


--
-- Name: waste_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.waste_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    house_id uuid NOT NULL,
    item_name text NOT NULL,
    quantity numeric(10,2),
    unit text,
    estimated_cost numeric(10,2),
    expired_on date NOT NULL,
    logged_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: chore_schedule chore_schedule_house_id_chore_type_id_scheduled_date_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chore_schedule
    ADD CONSTRAINT chore_schedule_house_id_chore_type_id_scheduled_date_key UNIQUE (house_id, chore_type_id, scheduled_date);


--
-- Name: chore_schedule chore_schedule_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chore_schedule
    ADD CONSTRAINT chore_schedule_pkey PRIMARY KEY (id);


--
-- Name: cook_recipe_proposals cook_recipe_proposals_cook_schedule_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cook_recipe_proposals
    ADD CONSTRAINT cook_recipe_proposals_cook_schedule_id_key UNIQUE (cook_schedule_id);


--
-- Name: cook_recipe_proposals cook_recipe_proposals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cook_recipe_proposals
    ADD CONSTRAINT cook_recipe_proposals_pkey PRIMARY KEY (id);


--
-- Name: cook_recipe_votes cook_recipe_votes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cook_recipe_votes
    ADD CONSTRAINT cook_recipe_votes_pkey PRIMARY KEY (id);


--
-- Name: cook_recipe_votes cook_recipe_votes_proposal_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cook_recipe_votes
    ADD CONSTRAINT cook_recipe_votes_proposal_id_user_id_key UNIQUE (proposal_id, user_id);


--
-- Name: cook_schedule cook_schedule_house_id_scheduled_date_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cook_schedule
    ADD CONSTRAINT cook_schedule_house_id_scheduled_date_key UNIQUE (house_id, scheduled_date);


--
-- Name: cook_schedule cook_schedule_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cook_schedule
    ADD CONSTRAINT cook_schedule_pkey PRIMARY KEY (id);


--
-- Name: cook_swap_requests cook_swap_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cook_swap_requests
    ADD CONSTRAINT cook_swap_requests_pkey PRIMARY KEY (id);


--
-- Name: cooking_sessions cooking_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cooking_sessions
    ADD CONSTRAINT cooking_sessions_pkey PRIMARY KEY (id);


--
-- Name: daily_nutrition daily_nutrition_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_nutrition
    ADD CONSTRAINT daily_nutrition_pkey PRIMARY KEY (user_id, date);


--
-- Name: expense_splits expense_splits_expense_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expense_splits
    ADD CONSTRAINT expense_splits_expense_id_user_id_key UNIQUE (expense_id, user_id);


--
-- Name: expense_splits expense_splits_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expense_splits
    ADD CONSTRAINT expense_splits_pkey PRIMARY KEY (id);


--
-- Name: expenses expenses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_pkey PRIMARY KEY (id);


--
-- Name: grocery_budgets grocery_budgets_house_id_month_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grocery_budgets
    ADD CONSTRAINT grocery_budgets_house_id_month_key UNIQUE (house_id, month);


--
-- Name: grocery_budgets grocery_budgets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grocery_budgets
    ADD CONSTRAINT grocery_budgets_pkey PRIMARY KEY (id);


--
-- Name: house_achievements house_achievements_house_id_achievement_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.house_achievements
    ADD CONSTRAINT house_achievements_house_id_achievement_key_key UNIQUE (house_id, achievement_key);


--
-- Name: house_achievements house_achievements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.house_achievements
    ADD CONSTRAINT house_achievements_pkey PRIMARY KEY (id);


--
-- Name: house_attendance house_attendance_house_id_user_id_attendance_date_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.house_attendance
    ADD CONSTRAINT house_attendance_house_id_user_id_attendance_date_key UNIQUE (house_id, user_id, attendance_date);


--
-- Name: house_attendance house_attendance_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.house_attendance
    ADD CONSTRAINT house_attendance_pkey PRIMARY KEY (id);


--
-- Name: house_chore_types house_chore_types_house_id_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.house_chore_types
    ADD CONSTRAINT house_chore_types_house_id_name_key UNIQUE (house_id, name);


--
-- Name: house_chore_types house_chore_types_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.house_chore_types
    ADD CONSTRAINT house_chore_types_pkey PRIMARY KEY (id);


--
-- Name: house_members house_members_house_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.house_members
    ADD CONSTRAINT house_members_house_id_user_id_key UNIQUE (house_id, user_id);


--
-- Name: house_members house_members_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.house_members
    ADD CONSTRAINT house_members_pkey PRIMARY KEY (id);


--
-- Name: house_pantry_items house_pantry_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.house_pantry_items
    ADD CONSTRAINT house_pantry_items_pkey PRIMARY KEY (id);


--
-- Name: houses houses_invite_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.houses
    ADD CONSTRAINT houses_invite_code_key UNIQUE (invite_code);


--
-- Name: houses houses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.houses
    ADD CONSTRAINT houses_pkey PRIMARY KEY (id);


--
-- Name: meal_plans meal_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meal_plans
    ADD CONSTRAINT meal_plans_pkey PRIMARY KEY (id);


--
-- Name: meal_plans meal_plans_user_id_scheduled_date_meal_type_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meal_plans
    ADD CONSTRAINT meal_plans_user_id_scheduled_date_meal_type_key UNIQUE (user_id, scheduled_date, meal_type);


--
-- Name: meal_ratings meal_ratings_cook_schedule_id_rated_by_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meal_ratings
    ADD CONSTRAINT meal_ratings_cook_schedule_id_rated_by_key UNIQUE (cook_schedule_id, rated_by);


--
-- Name: meal_ratings meal_ratings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meal_ratings
    ADD CONSTRAINT meal_ratings_pkey PRIMARY KEY (id);


--
-- Name: nutrition_logs nutrition_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nutrition_logs
    ADD CONSTRAINT nutrition_logs_pkey PRIMARY KEY (id);


--
-- Name: pantry_items pantry_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pantry_items
    ADD CONSTRAINT pantry_items_pkey PRIMARY KEY (id);


--
-- Name: prep_meals prep_meals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prep_meals
    ADD CONSTRAINT prep_meals_pkey PRIMARY KEY (id);


--
-- Name: recipe_ingredients recipe_ingredients_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recipe_ingredients
    ADD CONSTRAINT recipe_ingredients_pkey PRIMARY KEY (id);


--
-- Name: recipe_nutrition recipe_nutrition_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recipe_nutrition
    ADD CONSTRAINT recipe_nutrition_pkey PRIMARY KEY (recipe_id);


--
-- Name: recipe_ratings recipe_ratings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recipe_ratings
    ADD CONSTRAINT recipe_ratings_pkey PRIMARY KEY (recipe_id);


--
-- Name: recipe_reviews recipe_reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recipe_reviews
    ADD CONSTRAINT recipe_reviews_pkey PRIMARY KEY (id);


--
-- Name: recipe_reviews recipe_reviews_unique_per_user; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recipe_reviews
    ADD CONSTRAINT recipe_reviews_unique_per_user UNIQUE (recipe_id, user_id);


--
-- Name: recipes recipes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recipes
    ADD CONSTRAINT recipes_pkey PRIMARY KEY (id);


--
-- Name: refresh_token_denylist refresh_token_denylist_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refresh_token_denylist
    ADD CONSTRAINT refresh_token_denylist_pkey PRIMARY KEY (jti);


--
-- Name: shopping_items shopping_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shopping_items
    ADD CONSTRAINT shopping_items_pkey PRIMARY KEY (id);


--
-- Name: shopping_lists shopping_lists_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shopping_lists
    ADD CONSTRAINT shopping_lists_pkey PRIMARY KEY (id);


--
-- Name: shopping_shopper_rotation shopping_shopper_rotation_house_id_week_start_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shopping_shopper_rotation
    ADD CONSTRAINT shopping_shopper_rotation_house_id_week_start_key UNIQUE (house_id, week_start);


--
-- Name: shopping_shopper_rotation shopping_shopper_rotation_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shopping_shopper_rotation
    ADD CONSTRAINT shopping_shopper_rotation_pkey PRIMARY KEY (id);


--
-- Name: user_achievements user_achievements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_achievements
    ADD CONSTRAINT user_achievements_pkey PRIMARY KEY (id);


--
-- Name: user_achievements user_achievements_user_id_achievement_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_achievements
    ADD CONSTRAINT user_achievements_user_id_achievement_key_key UNIQUE (user_id, achievement_key);


--
-- Name: user_preferences user_preferences_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_preferences
    ADD CONSTRAINT user_preferences_pkey PRIMARY KEY (user_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: waste_logs waste_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.waste_logs
    ADD CONSTRAINT waste_logs_pkey PRIMARY KEY (id);


--
-- Name: chore_schedule_house_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX chore_schedule_house_date_idx ON public.chore_schedule USING btree (house_id, scheduled_date);


--
-- Name: chore_schedule_pending_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX chore_schedule_pending_idx ON public.chore_schedule USING btree (house_id, scheduled_date) WHERE (status = 'pending'::text);


--
-- Name: chore_schedule_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX chore_schedule_type_idx ON public.chore_schedule USING btree (house_id, chore_type_id);


--
-- Name: chore_schedule_user_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX chore_schedule_user_idx ON public.chore_schedule USING btree (user_id);


--
-- Name: cook_schedule_house_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX cook_schedule_house_date_idx ON public.cook_schedule USING btree (house_id, scheduled_date);


--
-- Name: cook_schedule_house_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX cook_schedule_house_id_idx ON public.cook_schedule USING btree (house_id);


--
-- Name: cook_schedule_scheduled_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX cook_schedule_scheduled_date_idx ON public.cook_schedule USING btree (scheduled_date);


--
-- Name: cook_schedule_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX cook_schedule_user_id_idx ON public.cook_schedule USING btree (user_id);


--
-- Name: expense_splits_expense_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX expense_splits_expense_id_idx ON public.expense_splits USING btree (expense_id);


--
-- Name: expense_splits_settled_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX expense_splits_settled_idx ON public.expense_splits USING btree (user_id, is_settled) WHERE (is_settled = false);


--
-- Name: expense_splits_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX expense_splits_user_id_idx ON public.expense_splits USING btree (user_id);


--
-- Name: expenses_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX expenses_created_at_idx ON public.expenses USING btree (created_at DESC);


--
-- Name: expenses_house_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX expenses_house_id_idx ON public.expenses USING btree (house_id);


--
-- Name: expenses_paid_by_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX expenses_paid_by_idx ON public.expenses USING btree (paid_by);


--
-- Name: grocery_budgets_house_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX grocery_budgets_house_idx ON public.grocery_budgets USING btree (house_id);


--
-- Name: house_achievements_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX house_achievements_idx ON public.house_achievements USING btree (house_id);


--
-- Name: house_attendance_house_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX house_attendance_house_date_idx ON public.house_attendance USING btree (house_id, attendance_date);


--
-- Name: house_attendance_user_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX house_attendance_user_idx ON public.house_attendance USING btree (user_id);


--
-- Name: house_chore_types_house_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX house_chore_types_house_idx ON public.house_chore_types USING btree (house_id);


--
-- Name: house_members_house_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX house_members_house_id_idx ON public.house_members USING btree (house_id);


--
-- Name: house_members_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX house_members_user_id_idx ON public.house_members USING btree (user_id);


--
-- Name: house_pantry_items_expiry_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX house_pantry_items_expiry_idx ON public.house_pantry_items USING btree (house_id, expiry_date) WHERE (expiry_date IS NOT NULL);


--
-- Name: house_pantry_items_house_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX house_pantry_items_house_id_idx ON public.house_pantry_items USING btree (house_id);


--
-- Name: houses_created_by_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX houses_created_by_idx ON public.houses USING btree (created_by);


--
-- Name: houses_invite_code_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX houses_invite_code_idx ON public.houses USING btree (invite_code);


--
-- Name: idx_cooking_sessions_recipe_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cooking_sessions_recipe_id ON public.cooking_sessions USING btree (recipe_id);


--
-- Name: idx_cooking_sessions_started_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cooking_sessions_started_at ON public.cooking_sessions USING btree (started_at DESC);


--
-- Name: idx_cooking_sessions_user_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cooking_sessions_user_active ON public.cooking_sessions USING btree (user_id) WHERE ((status)::text = 'in_progress'::text);


--
-- Name: idx_cooking_sessions_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cooking_sessions_user_id ON public.cooking_sessions USING btree (user_id);


--
-- Name: idx_daily_nutrition_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_daily_nutrition_date ON public.daily_nutrition USING btree (date DESC);


--
-- Name: idx_meal_plans_user_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_meal_plans_user_date ON public.meal_plans USING btree (user_id, scheduled_date);


--
-- Name: idx_meal_plans_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_meal_plans_user_id ON public.meal_plans USING btree (user_id);


--
-- Name: idx_nutrition_logs_auto; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_nutrition_logs_auto ON public.nutrition_logs USING btree (user_id, auto_logged) WHERE (auto_logged = true);


--
-- Name: idx_nutrition_logs_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_nutrition_logs_date ON public.nutrition_logs USING btree (date DESC);


--
-- Name: idx_nutrition_logs_recipe_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_nutrition_logs_recipe_id ON public.nutrition_logs USING btree (recipe_id);


--
-- Name: idx_nutrition_logs_user_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_nutrition_logs_user_date ON public.nutrition_logs USING btree (user_id, date DESC);


--
-- Name: idx_nutrition_logs_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_nutrition_logs_user_id ON public.nutrition_logs USING btree (user_id);


--
-- Name: idx_recipe_ingredients_name_trgm; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_recipe_ingredients_name_trgm ON public.recipe_ingredients USING gin (ingredient_name public.gin_trgm_ops);


--
-- Name: idx_recipe_ingredients_recipe_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_recipe_ingredients_recipe_id ON public.recipe_ingredients USING btree (recipe_id);


--
-- Name: idx_recipe_nutrition_calories; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_recipe_nutrition_calories ON public.recipe_nutrition USING btree (calories);


--
-- Name: idx_recipe_nutrition_verified_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_recipe_nutrition_verified_by ON public.recipe_nutrition USING btree (verified_by);


--
-- Name: idx_recipe_ratings_avg; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_recipe_ratings_avg ON public.recipe_ratings USING btree (average_rating DESC, total_ratings DESC);


--
-- Name: idx_recipe_reviews_recipe_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_recipe_reviews_recipe_created ON public.recipe_reviews USING btree (recipe_id, created_at DESC);


--
-- Name: idx_recipe_reviews_recipe_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_recipe_reviews_recipe_id ON public.recipe_reviews USING btree (recipe_id);


--
-- Name: idx_recipe_reviews_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_recipe_reviews_user_id ON public.recipe_reviews USING btree (user_id);


--
-- Name: idx_recipes_active_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_recipes_active_created ON public.recipes USING btree (created_at DESC) WHERE (deleted_at IS NULL);


--
-- Name: idx_recipes_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_recipes_created_at ON public.recipes USING btree (created_at DESC);


--
-- Name: idx_recipes_cuisine_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_recipes_cuisine_type ON public.recipes USING btree (cuisine_type);


--
-- Name: idx_recipes_difficulty; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_recipes_difficulty ON public.recipes USING btree (difficulty);


--
-- Name: idx_recipes_name_trgm; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_recipes_name_trgm ON public.recipes USING gin (name public.gin_trgm_ops);


--
-- Name: idx_recipes_verified; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_recipes_verified ON public.recipes USING btree (verified_by_dietitian) WHERE (verified_by_dietitian = true);


--
-- Name: idx_refresh_token_denylist_expires_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_refresh_token_denylist_expires_at ON public.refresh_token_denylist USING btree (expires_at);


--
-- Name: idx_refresh_token_denylist_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_refresh_token_denylist_user_id ON public.refresh_token_denylist USING btree (user_id);


--
-- Name: idx_shopping_items_list_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_shopping_items_list_id ON public.shopping_items USING btree (list_id);


--
-- Name: idx_shopping_items_list_unchecked; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_shopping_items_list_unchecked ON public.shopping_items USING btree (list_id) WHERE (is_checked = false);


--
-- Name: idx_shopping_lists_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_shopping_lists_created_at ON public.shopping_lists USING btree (created_at DESC);


--
-- Name: idx_shopping_lists_user_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_shopping_lists_user_active ON public.shopping_lists USING btree (user_id) WHERE ((status)::text = 'active'::text);


--
-- Name: idx_shopping_lists_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_shopping_lists_user_id ON public.shopping_lists USING btree (user_id);


--
-- Name: idx_user_preferences_cuisines; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_preferences_cuisines ON public.user_preferences USING gin (favorite_cuisines);


--
-- Name: idx_user_preferences_restrictions; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_preferences_restrictions ON public.user_preferences USING gin (dietary_restrictions);


--
-- Name: idx_users_admins; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_admins ON public.users USING btree (is_admin) WHERE (is_admin = true);


--
-- Name: idx_users_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_created_at ON public.users USING btree (created_at DESC);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: meal_plans_house_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX meal_plans_house_id_idx ON public.meal_plans USING btree (house_id) WHERE (house_id IS NOT NULL);


--
-- Name: meal_ratings_house_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX meal_ratings_house_idx ON public.meal_ratings USING btree (house_id);


--
-- Name: meal_ratings_schedule_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX meal_ratings_schedule_idx ON public.meal_ratings USING btree (cook_schedule_id);


--
-- Name: meal_ratings_user_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX meal_ratings_user_idx ON public.meal_ratings USING btree (rated_by);


--
-- Name: pantry_items_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pantry_items_user_id_idx ON public.pantry_items USING btree (user_id);


--
-- Name: prep_meals_available_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX prep_meals_available_idx ON public.prep_meals USING btree (house_id, available_until) WHERE (remaining_portions > 0);


--
-- Name: prep_meals_house_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX prep_meals_house_idx ON public.prep_meals USING btree (house_id);


--
-- Name: proposals_house_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX proposals_house_id_idx ON public.cook_recipe_proposals USING btree (house_id);


--
-- Name: proposals_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX proposals_status_idx ON public.cook_recipe_proposals USING btree (status) WHERE (status = 'voting'::text);


--
-- Name: recipe_votes_proposal_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX recipe_votes_proposal_idx ON public.cook_recipe_votes USING btree (proposal_id);


--
-- Name: shopper_rotation_house_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX shopper_rotation_house_idx ON public.shopping_shopper_rotation USING btree (house_id);


--
-- Name: shopper_rotation_week_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX shopper_rotation_week_idx ON public.shopping_shopper_rotation USING btree (house_id, week_start);


--
-- Name: shopping_lists_house_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX shopping_lists_house_id_idx ON public.shopping_lists USING btree (house_id) WHERE (house_id IS NOT NULL);


--
-- Name: swap_requests_house_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX swap_requests_house_idx ON public.cook_swap_requests USING btree (house_id);


--
-- Name: swap_requests_requester_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX swap_requests_requester_idx ON public.cook_swap_requests USING btree (requester_id);


--
-- Name: swap_requests_target_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX swap_requests_target_idx ON public.cook_swap_requests USING btree (target_id, status) WHERE (status = 'pending'::text);


--
-- Name: user_achievements_house_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_achievements_house_idx ON public.user_achievements USING btree (house_id);


--
-- Name: user_achievements_user_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_achievements_user_idx ON public.user_achievements USING btree (user_id);


--
-- Name: users_cook_skill_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX users_cook_skill_idx ON public.users USING btree (cook_skill);


--
-- Name: waste_logs_house_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX waste_logs_house_idx ON public.waste_logs USING btree (house_id, logged_at DESC);


--
-- Name: daily_nutrition daily_nutrition_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER daily_nutrition_set_updated_at BEFORE UPDATE ON public.daily_nutrition FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: recipe_reviews recipe_reviews_rating_aggregate_trg; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER recipe_reviews_rating_aggregate_trg AFTER INSERT OR DELETE OR UPDATE ON public.recipe_reviews FOR EACH ROW EXECUTE FUNCTION public.recipe_reviews_rating_aggregate();


--
-- Name: recipe_reviews recipe_reviews_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER recipe_reviews_set_updated_at BEFORE UPDATE ON public.recipe_reviews FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: shopping_items shopping_items_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER shopping_items_set_updated_at BEFORE UPDATE ON public.shopping_items FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: shopping_lists shopping_lists_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER shopping_lists_set_updated_at BEFORE UPDATE ON public.shopping_lists FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: user_preferences user_preferences_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER user_preferences_set_updated_at BEFORE UPDATE ON public.user_preferences FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: users users_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER users_set_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: chore_schedule chore_schedule_chore_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chore_schedule
    ADD CONSTRAINT chore_schedule_chore_type_id_fkey FOREIGN KEY (chore_type_id) REFERENCES public.house_chore_types(id) ON DELETE CASCADE;


--
-- Name: chore_schedule chore_schedule_house_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chore_schedule
    ADD CONSTRAINT chore_schedule_house_id_fkey FOREIGN KEY (house_id) REFERENCES public.houses(id) ON DELETE CASCADE;


--
-- Name: chore_schedule chore_schedule_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chore_schedule
    ADD CONSTRAINT chore_schedule_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: cook_recipe_proposals cook_recipe_proposals_cook_schedule_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cook_recipe_proposals
    ADD CONSTRAINT cook_recipe_proposals_cook_schedule_id_fkey FOREIGN KEY (cook_schedule_id) REFERENCES public.cook_schedule(id) ON DELETE CASCADE;


--
-- Name: cook_recipe_proposals cook_recipe_proposals_house_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cook_recipe_proposals
    ADD CONSTRAINT cook_recipe_proposals_house_id_fkey FOREIGN KEY (house_id) REFERENCES public.houses(id) ON DELETE CASCADE;


--
-- Name: cook_recipe_proposals cook_recipe_proposals_selected_recipe_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cook_recipe_proposals
    ADD CONSTRAINT cook_recipe_proposals_selected_recipe_id_fkey FOREIGN KEY (selected_recipe_id) REFERENCES public.recipes(id) ON DELETE SET NULL;


--
-- Name: cook_recipe_votes cook_recipe_votes_proposal_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cook_recipe_votes
    ADD CONSTRAINT cook_recipe_votes_proposal_id_fkey FOREIGN KEY (proposal_id) REFERENCES public.cook_recipe_proposals(id) ON DELETE CASCADE;


--
-- Name: cook_recipe_votes cook_recipe_votes_recipe_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cook_recipe_votes
    ADD CONSTRAINT cook_recipe_votes_recipe_id_fkey FOREIGN KEY (recipe_id) REFERENCES public.recipes(id) ON DELETE CASCADE;


--
-- Name: cook_recipe_votes cook_recipe_votes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cook_recipe_votes
    ADD CONSTRAINT cook_recipe_votes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: cook_schedule cook_schedule_house_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cook_schedule
    ADD CONSTRAINT cook_schedule_house_id_fkey FOREIGN KEY (house_id) REFERENCES public.houses(id) ON DELETE CASCADE;


--
-- Name: cook_schedule cook_schedule_recipe_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cook_schedule
    ADD CONSTRAINT cook_schedule_recipe_id_fkey FOREIGN KEY (recipe_id) REFERENCES public.recipes(id) ON DELETE SET NULL;


--
-- Name: cook_schedule cook_schedule_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cook_schedule
    ADD CONSTRAINT cook_schedule_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: cook_swap_requests cook_swap_requests_house_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cook_swap_requests
    ADD CONSTRAINT cook_swap_requests_house_id_fkey FOREIGN KEY (house_id) REFERENCES public.houses(id) ON DELETE CASCADE;


--
-- Name: cook_swap_requests cook_swap_requests_requester_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cook_swap_requests
    ADD CONSTRAINT cook_swap_requests_requester_id_fkey FOREIGN KEY (requester_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: cook_swap_requests cook_swap_requests_requester_schedule_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cook_swap_requests
    ADD CONSTRAINT cook_swap_requests_requester_schedule_id_fkey FOREIGN KEY (requester_schedule_id) REFERENCES public.cook_schedule(id) ON DELETE CASCADE;


--
-- Name: cook_swap_requests cook_swap_requests_target_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cook_swap_requests
    ADD CONSTRAINT cook_swap_requests_target_id_fkey FOREIGN KEY (target_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: cook_swap_requests cook_swap_requests_target_schedule_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cook_swap_requests
    ADD CONSTRAINT cook_swap_requests_target_schedule_id_fkey FOREIGN KEY (target_schedule_id) REFERENCES public.cook_schedule(id) ON DELETE CASCADE;


--
-- Name: cooking_sessions cooking_sessions_recipe_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cooking_sessions
    ADD CONSTRAINT cooking_sessions_recipe_id_fkey FOREIGN KEY (recipe_id) REFERENCES public.recipes(id) ON DELETE CASCADE;


--
-- Name: cooking_sessions cooking_sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cooking_sessions
    ADD CONSTRAINT cooking_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: daily_nutrition daily_nutrition_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_nutrition
    ADD CONSTRAINT daily_nutrition_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: expense_splits expense_splits_expense_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expense_splits
    ADD CONSTRAINT expense_splits_expense_id_fkey FOREIGN KEY (expense_id) REFERENCES public.expenses(id) ON DELETE CASCADE;


--
-- Name: expense_splits expense_splits_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expense_splits
    ADD CONSTRAINT expense_splits_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: expenses expenses_house_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_house_id_fkey FOREIGN KEY (house_id) REFERENCES public.houses(id) ON DELETE CASCADE;


--
-- Name: expenses expenses_paid_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_paid_by_fkey FOREIGN KEY (paid_by) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: expenses expenses_shopping_list_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_shopping_list_id_fkey FOREIGN KEY (shopping_list_id) REFERENCES public.shopping_lists(id) ON DELETE SET NULL;


--
-- Name: grocery_budgets grocery_budgets_house_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grocery_budgets
    ADD CONSTRAINT grocery_budgets_house_id_fkey FOREIGN KEY (house_id) REFERENCES public.houses(id) ON DELETE CASCADE;


--
-- Name: house_achievements house_achievements_house_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.house_achievements
    ADD CONSTRAINT house_achievements_house_id_fkey FOREIGN KEY (house_id) REFERENCES public.houses(id) ON DELETE CASCADE;


--
-- Name: house_attendance house_attendance_house_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.house_attendance
    ADD CONSTRAINT house_attendance_house_id_fkey FOREIGN KEY (house_id) REFERENCES public.houses(id) ON DELETE CASCADE;


--
-- Name: house_attendance house_attendance_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.house_attendance
    ADD CONSTRAINT house_attendance_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: house_chore_types house_chore_types_house_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.house_chore_types
    ADD CONSTRAINT house_chore_types_house_id_fkey FOREIGN KEY (house_id) REFERENCES public.houses(id) ON DELETE CASCADE;


--
-- Name: house_members house_members_house_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.house_members
    ADD CONSTRAINT house_members_house_id_fkey FOREIGN KEY (house_id) REFERENCES public.houses(id) ON DELETE CASCADE;


--
-- Name: house_members house_members_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.house_members
    ADD CONSTRAINT house_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: house_pantry_items house_pantry_items_added_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.house_pantry_items
    ADD CONSTRAINT house_pantry_items_added_by_fkey FOREIGN KEY (added_by) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: house_pantry_items house_pantry_items_house_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.house_pantry_items
    ADD CONSTRAINT house_pantry_items_house_id_fkey FOREIGN KEY (house_id) REFERENCES public.houses(id) ON DELETE CASCADE;


--
-- Name: houses houses_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.houses
    ADD CONSTRAINT houses_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: meal_plans meal_plans_house_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meal_plans
    ADD CONSTRAINT meal_plans_house_id_fkey FOREIGN KEY (house_id) REFERENCES public.houses(id) ON DELETE CASCADE;


--
-- Name: meal_plans meal_plans_recipe_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meal_plans
    ADD CONSTRAINT meal_plans_recipe_id_fkey FOREIGN KEY (recipe_id) REFERENCES public.recipes(id) ON DELETE CASCADE;


--
-- Name: meal_plans meal_plans_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meal_plans
    ADD CONSTRAINT meal_plans_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: meal_ratings meal_ratings_cook_schedule_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meal_ratings
    ADD CONSTRAINT meal_ratings_cook_schedule_id_fkey FOREIGN KEY (cook_schedule_id) REFERENCES public.cook_schedule(id) ON DELETE CASCADE;


--
-- Name: meal_ratings meal_ratings_house_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meal_ratings
    ADD CONSTRAINT meal_ratings_house_id_fkey FOREIGN KEY (house_id) REFERENCES public.houses(id) ON DELETE CASCADE;


--
-- Name: meal_ratings meal_ratings_rated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meal_ratings
    ADD CONSTRAINT meal_ratings_rated_by_fkey FOREIGN KEY (rated_by) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: nutrition_logs nutrition_logs_recipe_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nutrition_logs
    ADD CONSTRAINT nutrition_logs_recipe_id_fkey FOREIGN KEY (recipe_id) REFERENCES public.recipes(id) ON DELETE SET NULL;


--
-- Name: nutrition_logs nutrition_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nutrition_logs
    ADD CONSTRAINT nutrition_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: prep_meals prep_meals_cooked_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prep_meals
    ADD CONSTRAINT prep_meals_cooked_by_fkey FOREIGN KEY (cooked_by) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: prep_meals prep_meals_house_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prep_meals
    ADD CONSTRAINT prep_meals_house_id_fkey FOREIGN KEY (house_id) REFERENCES public.houses(id) ON DELETE CASCADE;


--
-- Name: prep_meals prep_meals_recipe_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prep_meals
    ADD CONSTRAINT prep_meals_recipe_id_fkey FOREIGN KEY (recipe_id) REFERENCES public.recipes(id) ON DELETE RESTRICT;


--
-- Name: recipe_ingredients recipe_ingredients_recipe_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recipe_ingredients
    ADD CONSTRAINT recipe_ingredients_recipe_id_fkey FOREIGN KEY (recipe_id) REFERENCES public.recipes(id) ON DELETE CASCADE;


--
-- Name: recipe_nutrition recipe_nutrition_recipe_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recipe_nutrition
    ADD CONSTRAINT recipe_nutrition_recipe_id_fkey FOREIGN KEY (recipe_id) REFERENCES public.recipes(id) ON DELETE CASCADE;


--
-- Name: recipe_nutrition recipe_nutrition_verified_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recipe_nutrition
    ADD CONSTRAINT recipe_nutrition_verified_by_fkey FOREIGN KEY (verified_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: recipe_ratings recipe_ratings_recipe_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recipe_ratings
    ADD CONSTRAINT recipe_ratings_recipe_id_fkey FOREIGN KEY (recipe_id) REFERENCES public.recipes(id) ON DELETE CASCADE;


--
-- Name: recipe_reviews recipe_reviews_recipe_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recipe_reviews
    ADD CONSTRAINT recipe_reviews_recipe_id_fkey FOREIGN KEY (recipe_id) REFERENCES public.recipes(id) ON DELETE CASCADE;


--
-- Name: recipe_reviews recipe_reviews_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recipe_reviews
    ADD CONSTRAINT recipe_reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: refresh_token_denylist refresh_token_denylist_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refresh_token_denylist
    ADD CONSTRAINT refresh_token_denylist_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: shopping_items shopping_items_list_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shopping_items
    ADD CONSTRAINT shopping_items_list_id_fkey FOREIGN KEY (list_id) REFERENCES public.shopping_lists(id) ON DELETE CASCADE;


--
-- Name: shopping_lists shopping_lists_house_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shopping_lists
    ADD CONSTRAINT shopping_lists_house_id_fkey FOREIGN KEY (house_id) REFERENCES public.houses(id) ON DELETE CASCADE;


--
-- Name: shopping_lists shopping_lists_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shopping_lists
    ADD CONSTRAINT shopping_lists_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: shopping_shopper_rotation shopping_shopper_rotation_house_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shopping_shopper_rotation
    ADD CONSTRAINT shopping_shopper_rotation_house_id_fkey FOREIGN KEY (house_id) REFERENCES public.houses(id) ON DELETE CASCADE;


--
-- Name: shopping_shopper_rotation shopping_shopper_rotation_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shopping_shopper_rotation
    ADD CONSTRAINT shopping_shopper_rotation_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_achievements user_achievements_house_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_achievements
    ADD CONSTRAINT user_achievements_house_id_fkey FOREIGN KEY (house_id) REFERENCES public.houses(id) ON DELETE SET NULL;


--
-- Name: user_achievements user_achievements_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_achievements
    ADD CONSTRAINT user_achievements_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_preferences user_preferences_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_preferences
    ADD CONSTRAINT user_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: waste_logs waste_logs_house_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.waste_logs
    ADD CONSTRAINT waste_logs_house_id_fkey FOREIGN KEY (house_id) REFERENCES public.houses(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--


